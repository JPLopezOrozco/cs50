from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', related_name='followers', symmetrical=False, blank=True)


    
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_post")
    post_content = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    
    def __str__(self):
        return f"ID: {self.id}, User: {self.user.username}"
    
