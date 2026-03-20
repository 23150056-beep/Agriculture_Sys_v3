from .models import ActivityLog


def log_activity(*, actor, module, action, message, metadata=None):
    return ActivityLog.objects.create(
        actor=actor,
        role=getattr(actor, "role", "") if actor else "",
        module=module,
        action=action,
        message=message,
        metadata=metadata or {},
    )
