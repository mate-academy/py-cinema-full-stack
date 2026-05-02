import logging

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer

logger = logging.getLogger(__name__)


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    authentication_classes = ()


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def dispatch(self, request, *args, **kwargs):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "MISSING")
        print(f"DEBUG /me/ Authorization: [{auth_header if auth_header != 'MISSING' else 'MISSING'}]", flush=True)
        return super().dispatch(request, *args, **kwargs)
