from rest_framework import serializers
from .models import Post, SavePost, LikePost, Comment, Follow, CustomUser, UserActivity

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'profile_picture', 'followers_count', 'following_count', 'is_following']

    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj).count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(obj, 'is_following'):
            return obj.is_following
        if request and request.user.is_authenticated and obj != request.user:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'image', 'price', 'category', 'created_at', 'updated_at', 'user', 'likes_count', 'comments_count', 'is_liked', 'is_saved']

    def get_likes_count(self, obj):
        return obj.liked_by_users.count()

    def get_comments_count(self, obj):
        return obj.comment_by_users.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by_users.filter(user=request.user).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False

class SavePostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    post_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = SavePost
        fields = ['id', 'post', 'post_id', 'user', 'created_at', 'updated_at']

class LikePostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    post_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = LikePost
        fields = ['id', 'post', 'post_id', 'user', 'created_at', 'updated_at']

class CommentSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    post_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'post_id', 'user', 'content', 'created_at', 'updated_at']

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    following_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'following_id', 'created_at', 'updated_at']

class UserActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    target_post = PostSerializer(read_only=True)
    target_user = UserSerializer(read_only=True)

    class Meta:
        model = UserActivity
        fields = '__all__'
