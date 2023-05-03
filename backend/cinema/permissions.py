from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrIfAuthenticatedReadOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(
            (
                request.method in SAFE_METHODS
                and request.user
                and request.user.is_authenticated
            )
            or (request.user and request.user.is_staff)
        )


# class BookList(generics.ListCreateAPIView):
#     queryset = Book.objects.all()
#     serializer_class = BookSerializer
#     permission_classes = [AllowAny] # дозволити всім користувачам переглядати список книг без обмежень


# class AllowAny(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return True або ж можна і без цього це built-in method
