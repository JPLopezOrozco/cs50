from rest_framework import serializers
from .models import User, Post


class UserSerializer(serializers.ModelSerializer):

    def get_followers(self, obj):
        return [follower.id for follower in obj.followers.all()]
    
    class Meta:
        model = User
        fields = ('id', 'username', 'following', 'followers')
        
class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'username', 'user', 'post_content', 'timestamp', 'likes']
