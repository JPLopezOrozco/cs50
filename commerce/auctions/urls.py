from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newlisting/", views.newlisting, name="newlisting"),
    path("listing/<int:auction_id>", views.listing, name="listing"),
    path("auction/<int:auction_id>", views.auction_bid, name="auction_bid"),
    path("close/", views.close, name="close"),
    path("close/<int:auction_id>", views.close_bid, name="close_bid"),
    path("<int:auction_id>/comments", views.comments, name="comments"),
    path("watchlist/", views.watchlist, name="watchlist"),
    path("categories/", views.categories, name ="categories")
]
