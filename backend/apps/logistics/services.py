def capacity_ok(vehicle_capacity_kg, shipment_weights):
    return sum(shipment_weights) <= float(vehicle_capacity_kg)


def trip_load_kg(trip):
    return sum(float(shipment.order.quantity) for shipment in trip.shipments.select_related("order").all())


def can_assign_shipment_to_trip(trip, shipment):
    current_load = trip_load_kg(trip)
    next_load = current_load + float(shipment.order.quantity)
    return next_load <= float(trip.vehicle.capacity_kg)


VALID_SHIPMENT_TRANSITIONS = {
    "PENDING_ASSIGNMENT": {"SCHEDULED", "FAILED"},
    "SCHEDULED": {"LOADED", "DELAYED", "FAILED"},
    "LOADED": {"IN_TRANSIT", "DELAYED", "FAILED"},
    "IN_TRANSIT": {"DELIVERED", "DELAYED", "FAILED"},
    "DELAYED": {"SCHEDULED", "LOADED", "IN_TRANSIT", "FAILED"},
    "FAILED": set(),
    "DELIVERED": set(),
}


def is_valid_shipment_transition(current_status, next_status):
    if current_status == next_status:
        return True
    return next_status in VALID_SHIPMENT_TRANSITIONS.get(current_status, set())
