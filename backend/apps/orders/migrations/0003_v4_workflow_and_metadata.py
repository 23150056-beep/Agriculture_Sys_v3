from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0002_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="status",
            field=models.CharField(
                choices=[
                    ("DRAFT", "Draft"),
                    ("SUBMITTED", "Submitted"),
                    ("UNDER_REVIEW", "Under Review"),
                    ("APPROVED", "Approved"),
                    ("REJECTED", "Rejected"),
                    ("IN_DELIVERY", "In Delivery"),
                    ("DELIVERED", "Delivered"),
                    ("CONFIRMED", "Confirmed"),
                ],
                default="DRAFT",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="orderstatuslog",
            name="metadata_json",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
