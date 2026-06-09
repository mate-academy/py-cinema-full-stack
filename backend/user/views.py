from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)

    def get_object(self):
        return self.request.user
