from datetime import date


def should_mark_urgent(available_until):
    if not available_until:
        return False
    days_left = (available_until - date.today()).days
    return days_left <= 2
