from django.urls import include, path
from rest_framework import routers
from . import views




router = routers.DefaultRouter()
router.register(r'user', views.UserViewSet, basename='user')
router.register(r'post', views.PostViewSet, basename='post')



urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("<str:profile>/", views.profile, name="profile"),
    path("following", views.following, name="following"),
    
    
    #Api routes
    path('api/', include(router.urls)),   
]
