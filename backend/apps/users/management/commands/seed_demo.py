import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.utils import OperationalError
from django.utils import timezone

from apps.catalog.models import Category, Product
from apps.demand_board.models import DemandOffer, DemandPost
from apps.analytics.models import CommitmentActualSnapshot, WeeklyReport
from apps.exceptions.models import ExceptionCase
from apps.listings.models import Listing
from apps.locations.models import Location
from apps.logistics.models import Driver, Shipment, Trip, Vehicle
from apps.orders.models import Order, OrderStatusLog
from apps.prioritization.models import PriorityScore
from apps.recommendations.models import GuidedAction, ReorderAlert, RequestRecommendation
from apps.reliability.models import DeliveryScore
from apps.season_planner.models import SeasonMilestone, SeasonPlan

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data for the agriculture distribution prototype"

    def add_arguments(self, parser):
        parser.add_argument("--password", type=str, default="demo12345")
        parser.add_argument("--reset", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        reset = options["reset"]

        random.seed(42)

        demo_usernames = [
            "demo_admin",
            "demo_manager_1",
            "demo_manager_2",
            "demo_distributor_1",
            "demo_distributor_2",
        ]

        if reset:
            self.stdout.write("Resetting existing demo data...")
            try:
                DemandOffer.objects.filter(
                    demand_post__buyer__username__in=demo_usernames
                ).delete()
                DemandOffer.objects.filter(farmer__username__in=demo_usernames).delete()
                DemandPost.objects.filter(buyer__username__in=demo_usernames).delete()
                Shipment.objects.filter(order__buyer__username__in=demo_usernames).delete()
                OrderStatusLog.objects.filter(order__buyer__username__in=demo_usernames).delete()
                Order.objects.filter(buyer__username__in=demo_usernames).delete()
                Listing.objects.filter(farmer__username__in=demo_usernames).delete()
                Trip.objects.filter(dispatcher__username__in=["demo_manager_1", "demo_manager_2"]).delete()
                Driver.objects.filter(license_no__startswith="DEMO-").delete()
                Vehicle.objects.filter(plate_number__startswith="DEMO-").delete()
                Product.objects.filter(name__startswith="DEMO ").delete()
                Category.objects.filter(name__startswith="Demo ").delete()
                Location.objects.filter(province__startswith="DemoProvince").delete()
                CommitmentActualSnapshot.objects.filter(distributor__username__in=demo_usernames).delete()
                WeeklyReport.objects.filter(generated_by__username__in=demo_usernames).delete()
                ExceptionCase.objects.all().delete()
                PriorityScore.objects.filter(request__buyer__username__in=demo_usernames).delete()
                RequestRecommendation.objects.filter(distributor__username__in=demo_usernames).delete()
                ReorderAlert.objects.all().delete()
                GuidedAction.objects.filter(user__username__in=demo_usernames).delete()
                DeliveryScore.objects.filter(delivery__order__buyer__username__in=demo_usernames).delete()
                SeasonMilestone.objects.filter(season_plan__distributor__username__in=demo_usernames).delete()
                SeasonPlan.objects.filter(distributor__username__in=demo_usernames).delete()
                User.objects.filter(username__in=demo_usernames).delete()
            except OperationalError:
                self.stdout.write("Demo tables not present yet, skipping reset cleanup.")

        users = {
            "admin": self._upsert_user(
                "demo_admin",
                "ADMIN",
                "Demo Admin",
                "demo_admin@example.com",
                "09170000001",
                password,
                is_staff=True,
                is_superuser=True,
            ),
            "distributor_1": self._upsert_user(
                "demo_distributor_1",
                "DISTRIBUTOR",
                "Demo Distributor One",
                "demo_distributor_1@example.com",
                "09170000002",
                password,
            ),
            "distributor_2": self._upsert_user(
                "demo_distributor_2",
                "DISTRIBUTOR",
                "Demo Distributor Two",
                "demo_distributor_2@example.com",
                "09170000003",
                password,
            ),
            "manager_1": self._upsert_user(
                "demo_manager_1",
                "MANAGER",
                "Demo Manager One",
                "demo_manager_1@example.com",
                "09170000004",
                password,
            ),
            "manager_2": self._upsert_user(
                "demo_manager_2",
                "MANAGER",
                "Demo Manager Two",
                "demo_manager_2@example.com",
                "09170000005",
                password,
            ),
        }

        categories = {
            "Vegetables": self._upsert_category("Demo Vegetables"),
            "Fruits": self._upsert_category("Demo Fruits"),
            "Grains": self._upsert_category("Demo Grains"),
        }

        product_specs = [
            ("Tomato", "Vegetables", "kg"),
            ("Onion", "Vegetables", "kg"),
            ("Eggplant", "Vegetables", "kg"),
            ("Cabbage", "Vegetables", "kg"),
            ("Banana", "Fruits", "kg"),
            ("Mango", "Fruits", "crate"),
            ("Pineapple", "Fruits", "crate"),
            ("Rice", "Grains", "sack"),
            ("Corn", "Grains", "sack"),
            ("Mongo", "Grains", "kg"),
        ]
        products = []
        for name, category_name, unit in product_specs:
            product, _ = Product.objects.update_or_create(
                name=f"DEMO {name}",
                defaults={"category": categories[category_name], "default_unit": unit},
            )
            products.append(product)

        location_specs = [
            ("DemoProvince A", "City Alpha", "Barangay Uno"),
            ("DemoProvince A", "City Alpha", "Barangay Dos"),
            ("DemoProvince A", "City Beta", "Barangay Tres"),
            ("DemoProvince B", "City Delta", "Barangay Apat"),
            ("DemoProvince B", "City Echo", "Barangay Lima"),
            ("DemoProvince C", "City Foxtrot", "Barangay Anim"),
        ]
        locations = []
        for province, city, barangay in location_specs:
            location, _ = Location.objects.update_or_create(
                province=province,
                city_municipality=city,
                barangay=barangay,
                defaults={"postal_code": "1000"},
            )
            locations.append(location)

        listings = []
        today = timezone.localdate()
        for index in range(20):
            farmer = users["distributor_1"] if index % 2 == 0 else users["distributor_2"]
            product = products[index % len(products)]
            location = locations[index % len(locations)]
            quantity = Decimal(str(90 + index * 3))
            unit_price = Decimal(str(18 + (index % 7) * 2))
            listing, _ = Listing.objects.update_or_create(
                farmer=farmer,
                product=product,
                location=location,
                unit=product.default_unit,
                quality_grade=["A", "B", "C"][index % 3],
                available_until=today + timedelta(days=2 + (index % 5)),
                defaults={
                    "quantity_available": quantity,
                    "unit_price": unit_price,
                    "harvest_date": today - timedelta(days=1 + (index % 4)),
                    "urgent_sale": (index % 5 == 0),
                    "status": "ACTIVE",
                },
            )
            listings.append(listing)

        managers = [users["manager_1"], users["manager_2"]]
        order_statuses = [
            "DRAFT",
            "SUBMITTED",
            "UNDER_REVIEW",
            "APPROVED",
            "IN_DELIVERY",
            "DELIVERED",
            "CONFIRMED",
            "REJECTED",
        ]
        orders = []
        for index in range(8):
            listing = listings[index]
            manager = managers[index % len(managers)]
            quantity = Decimal("10") + Decimal(str(index))
            total = quantity * listing.unit_price
            order = Order.objects.create(
                buyer=manager,
                listing=listing,
                quantity=quantity,
                unit_price_snapshot=listing.unit_price,
                total_price=total,
                status=order_statuses[index],
                delivery_location=locations[(index + 1) % len(locations)],
                expected_delivery_date=today + timedelta(days=3 + index),
            )
            orders.append(order)
            self._create_status_timeline(order, manager)

        vehicles = []
        for index, capacity in enumerate([1200, 1500, 1800], start=1):
            vehicle, _ = Vehicle.objects.update_or_create(
                plate_number=f"DEMO-TRK-{index:03d}",
                defaults={"vehicle_type": "Truck", "capacity_kg": Decimal(str(capacity)), "is_active": True},
            )
            vehicles.append(vehicle)

        drivers = []
        for index in range(1, 4):
            driver, _ = Driver.objects.update_or_create(
                license_no=f"DEMO-LIC-{index:03d}",
                defaults={
                    "name": f"Demo Driver {index}",
                    "phone": f"0917900000{index}",
                    "is_active": True,
                },
            )
            drivers.append(driver)

        trips = []
        for index in range(3):
            trip = Trip.objects.create(
                dispatcher=users["manager_1"],
                vehicle=vehicles[index],
                driver=drivers[index],
                scheduled_date=today + timedelta(days=1 + index),
                status="SCHEDULED",
            )
            trips.append(trip)

        for index, order in enumerate(orders):
            shipment_status = "PENDING_ASSIGNMENT"
            trip = None
            if order.status in ["IN_DELIVERY", "DELIVERED", "CONFIRMED"]:
                shipment_status = {
                    "IN_DELIVERY": "IN_TRANSIT",
                    "DELIVERED": "DELIVERED",
                    "CONFIRMED": "DELIVERED",
                }[order.status]
                trip = trips[index % len(trips)]

            Shipment.objects.create(
                order=order,
                trip=trip,
                eta=timezone.now() + timedelta(days=2),
                status=shipment_status,
            )

        demand_posts = []
        for index in range(5):
            demand_post = DemandPost.objects.create(
                buyer=managers[index % len(managers)],
                product=products[(index + 2) % len(products)],
                target_quantity=Decimal(str(50 + index * 10)),
                budget_min=Decimal("1000.00") + Decimal(str(index * 300)),
                budget_max=Decimal("1800.00") + Decimal(str(index * 350)),
                required_by_date=today + timedelta(days=7 + index),
                location=locations[index % len(locations)],
                status="OPEN",
            )
            demand_posts.append(demand_post)

        farmers = [users["distributor_1"], users["distributor_2"]]
        for index, post in enumerate(demand_posts):
            DemandOffer.objects.create(
                demand_post=post,
                farmer=farmers[index % len(farmers)],
                offered_quantity=Decimal(str(20 + index * 4)),
                offered_price=Decimal("1200.00") + Decimal(str(index * 200)),
                note="Demo offer",
                status="PENDING",
            )

        # Seed feature-expansion module records for prototype demos.
        for index, order in enumerate(orders):
            PriorityScore.objects.update_or_create(
                request=order,
                defaults={
                    "score_total": Decimal(str(70 + (index % 20))),
                    "factors_json": {
                        "urgency": 20,
                        "waiting_time": 15,
                        "stock_risk": 20,
                        "distributor_reliability": 15,
                    },
                },
            )

            RequestRecommendation.objects.create(
                distributor=users["distributor_1" if index % 2 == 0 else "distributor_2"],
                product=order.listing.product,
                suggested_qty=order.quantity + Decimal("5.00"),
                confidence=Decimal("0.65"),
                reason_json={"source": "seed_demo", "hint": "historical average + buffer"},
            )

        for shipment in Shipment.objects.filter(order__in=orders):
            DeliveryScore.objects.update_or_create(
                delivery=shipment,
                defaults={
                    "on_time_score": Decimal("85.00"),
                    "proof_score": Decimal("75.00"),
                    "completion_score": Decimal("80.00"),
                    "total_score": Decimal("80.50"),
                },
            )

        for product in products[:4]:
            ReorderAlert.objects.create(
                product=product,
                location=locations[0],
                risk_level="MEDIUM",
                projected_stockout_date=today + timedelta(days=9),
                status="OPEN",
            )

        for user_key in ["distributor_1", "distributor_2", "manager_1", "manager_2"]:
            GuidedAction.objects.create(
                user=users[user_key],
                role=users[user_key].role,
                action_type="NEXT_STEP",
                title=f"Review pending operations for {users[user_key].username}",
                payload_json={"source": "seed_demo"},
                priority=80,
                is_done=False,
            )

        for index, order in enumerate(orders[:4]):
            ExceptionCase.objects.create(
                exception_type="REQUEST_STALLED",
                entity_type="request",
                entity_id=order.id,
                severity="MEDIUM",
                owner_role="MANAGER",
                status="OPEN",
            )

        for index, distributor in enumerate([users["distributor_1"], users["distributor_2"]]):
            plan = SeasonPlan.objects.create(
                distributor=distributor,
                product=products[index],
                season_name=f"Demo Season {index + 1}",
                start_date=today,
                target_harvest_date=today + timedelta(days=60),
                area_size=Decimal("1.50") + Decimal(str(index)),
                status="ACTIVE",
            )
            SeasonMilestone.objects.create(
                season_plan=plan,
                milestone_type="PLANTING",
                due_date=today + timedelta(days=3),
            )
            SeasonMilestone.objects.create(
                season_plan=plan,
                milestone_type="HARVEST",
                due_date=today + timedelta(days=58),
            )

        WeeklyReport.objects.create(
            week_start=today - timedelta(days=today.weekday()),
            week_end=today - timedelta(days=today.weekday()) + timedelta(days=6),
            generated_by=users["admin"],
            summary_json={"seeded": True, "requests": len(orders), "shipments": Shipment.objects.filter(order__in=orders).count()},
        )

        for index, post in enumerate(demand_posts[:3]):
            distributor = users["distributor_1" if index % 2 == 0 else "distributor_2"]
            committed = Decimal(str(40 + index * 5))
            actual = Decimal(str(35 + index * 4))
            CommitmentActualSnapshot.objects.create(
                demand_post=post,
                distributor=distributor,
                committed_qty=committed,
                actual_delivered_qty=actual,
                variance_qty=committed - actual,
                snapshot_date=today,
            )

        self.stdout.write(self.style.SUCCESS("Demo seed complete."))
        self.stdout.write("Accounts password: {}".format(password))
        self.stdout.write("Created: 5 users, 10 products, 20 listings, 8 requests, 3 trips, 5 demand posts")

    def _upsert_user(self, username, role, full_name, email, phone, password, is_staff=False, is_superuser=False):
        user, _ = User.objects.update_or_create(
            username=username,
            defaults={
                "role": role,
                "full_name": full_name,
                "email": email,
                "phone": phone,
                "is_active": True,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
            },
        )
        user.set_password(password)
        user.save()
        return user

    def _upsert_category(self, name):
        category, _ = Category.objects.get_or_create(name=name)
        return category

    def _create_status_timeline(self, order, actor):
        path = {
            "DRAFT": ["DRAFT"],
            "SUBMITTED": ["DRAFT", "SUBMITTED"],
            "UNDER_REVIEW": ["DRAFT", "SUBMITTED", "UNDER_REVIEW"],
            "APPROVED": ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"],
            "IN_DELIVERY": ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "IN_DELIVERY"],
            "DELIVERED": ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "IN_DELIVERY", "DELIVERED"],
            "CONFIRMED": ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "IN_DELIVERY", "DELIVERED", "CONFIRMED"],
            "REJECTED": ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REJECTED"],
        }.get(order.status, [order.status])

        previous = ""
        for status in path:
            OrderStatusLog.objects.create(
                order=order,
                from_status=previous,
                to_status=status,
                changed_by=actor,
                note="Seeded timeline",
            )
            previous = status
