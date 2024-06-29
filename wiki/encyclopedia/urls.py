from django.urls import path

from . import views

app_name = "wiki"
urlpatterns = [
    path("", views.index, name="index"),
    path("newpage/", views.new_page, name="new_page"),
    path("<str:title>/edit/",views.edit, name="edit"),
    path("randompage/", views.random_page, name="random_page"),
    path("<str:title>/", views.entries, name="entries"),
]
