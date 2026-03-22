VALID_TRANSITIONS = {
    "DRAFT": {"SUBMITTED"},
    "SUBMITTED": {"UNDER_REVIEW"},
    "UNDER_REVIEW": {"APPROVED", "REJECTED"},
    "APPROVED": {"IN_DELIVERY"},
    "IN_DELIVERY": {"DELIVERED"},
    "DELIVERED": {"CONFIRMED"},
    "REJECTED": set(),
    "CONFIRMED": set(),
}


def is_valid_transition(current_status, next_status):
    if current_status == next_status:
        return True
    return next_status in VALID_TRANSITIONS.get(current_status, set())
