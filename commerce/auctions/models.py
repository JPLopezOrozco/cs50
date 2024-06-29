from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class AuctionsList(models.Model):
    title = models.CharField(max_length = 64)
    description = models.CharField(max_length = 255)
    image = models.ImageField(upload_to='auctions/auction_img/', null=True, blank=True, default=None)
    category = models.CharField(max_length = 64)
    listed_by = models.CharField(max_length = 64)
    bid = models.IntegerField()
    winner = models.CharField(max_length=64, null=True, blank=True, default=None)
    close = models.BooleanField(default=False)


class Comments(models.Model):
    auction = models.ForeignKey(AuctionsList, on_delete=models.CASCADE, related_name="comment")
    username = models.CharField(max_length = 64)
    comment = models.CharField(max_length = 255)    

class Bid(models.Model):
    auction = models.ForeignKey(AuctionsList, on_delete=models.CASCADE, related_name="bids")
    price = models.IntegerField()