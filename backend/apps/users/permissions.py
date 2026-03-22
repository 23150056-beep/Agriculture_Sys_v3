from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)


class IsDistributor(IsRole):
    allowed_roles = ["DISTRIBUTOR", "ADMIN"]


class IsManager(IsRole):
    allowed_roles = ["MANAGER", "ADMIN"]


class IsAdmin(IsRole):
    allowed_roles = ["ADMIN"]
