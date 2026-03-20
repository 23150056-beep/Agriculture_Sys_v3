VALID_TRANSITIONS = {
    "PENDING": {"CONFIRMED", "CANCELLED"},
    "CONFIRMED": {"PACKED", "CANCELLED"},
    "PACKED": {"ASSIGNED", "CANCELLED"},
    "ASSIGNED": {"IN_TRANSIT", "CANCELLED"},
    "IN_TRANSIT": {"DELIVERED", "CANCELLED"},
}


def is_valid_transition(current_status, next_status):
    if current_status == next_status:
        return True
    return next_status in VALID_TRANSITIONS.get(current_status, set())
