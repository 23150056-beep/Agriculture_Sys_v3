from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)


class IsFarmer(IsRole):
    allowed_roles = ["FARMER", "ADMIN"]


class IsBuyer(IsRole):
    allowed_roles = ["BUYER", "ADMIN"]


class IsDispatcher(IsRole):
    allowed_roles = ["DISPATCHER", "ADMIN"]
