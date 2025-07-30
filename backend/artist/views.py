from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveUpdateAPIView
from .models import Post, SavePost, LikePost, Comment, Follow, CustomUser, UserActivity
from .serializers import (
    PostSerializer, SavePostSerializer, LikePostSerializer, 
    CommentSerializer, FollowSerializer, UserActivitySerializer,
    UserSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework import viewsets
from django.db.models import Q

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



class PostListCreateView(ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class PostDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class SavePostListCreateView(ListCreateAPIView):
    serializer_class = SavePostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavePost.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        
        # Check if already saved
        existing_save = SavePost.objects.filter(user=self.request.user, post=post).first()
        if existing_save:
            # If already saved, delete it (unsave)
            existing_save.delete()
            return Response(
                {"detail": "Post unsaved successfully"},
                status=status.HTTP_200_OK
            )
        
        # If not saved, save it
        serializer.save(user=self.request.user, post=post)
        return Response(
            {"detail": "Post saved successfully"},
            status=status.HTTP_201_CREATED
        )

class SavePostDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = SavePostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavePost.objects.filter(user=self.request.user)

class LikePostListCreateView(ListCreateAPIView):
    serializer_class = LikePostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LikePost.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        if LikePost.objects.filter(user=self.request.user, post=post).exists():
            return Response(
                {"detail": "Post already liked"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(user=self.request.user, post=post)

class LikePostDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = LikePostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LikePost.objects.filter(user=self.request.user)

class CommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        post_id = self.request.query_params.get('post_id')
        queryset = Comment.objects.all().order_by('-created_at')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset

    def perform_create(self, serializer):
        post_id = self.request.data.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(user=self.request.user, post=post)

class CommentDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return Comment.objects.filter(user=self.request.user)
        return Comment.objects.all()

class FollowListCreateView(ListCreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        following_id = self.request.data.get('following_id')
        following = get_object_or_404(CustomUser, id=following_id)
        if following == self.request.user:
            return Response(
                {"detail": "Cannot follow yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if Follow.objects.filter(follower=self.request.user, following=following).exists():
            return Response(
                {"detail": "Already following this user"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save(follower=self.request.user, following=following)

class FollowDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)

class UserActivityView(ListCreateAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get('username')
        if username:
            user = get_object_or_404(CustomUser, username=username)
            return UserActivity.objects.filter(user=user).order_by('-timestamp')
        return UserActivity.objects.filter(user=self.request.user).order_by('-timestamp')
    

from django.conf import settings
from django.test import RequestFactory
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from oauth2_provider.views import TokenView


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"detail": "Please provide both username and password"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Prepare an internal request for the token endpoint
    factory = RequestFactory()
    token_request = factory.post(
        '/o/token/',
        {
            'grant_type': 'password',
            'username': username,
            'password': password,
            'client_id': settings.CLIENT_ID,
            'client_secret': settings.CLIENT_SECRET,
        }
    )

    # Call TokenView internally
    token_view = TokenView.as_view()
    token_response = token_view(token_request)

    # If authentication failed, return error
    if token_response.status_code != 200:
        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Return OAuth token JSON
    return token_response

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not all([email, username, password]):
        return Response(
            {"detail": "Please provide email, username and password"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if CustomUser.objects.filter(username=username).exists():
        return Response(
            {"detail": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if CustomUser.objects.filter(email=email).exists():
        return Response(
            {"detail": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = CustomUser.objects.create_user(
            email=email,
            username=username,
            password=password
        )
        return Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        username = self.kwargs.get('username', None)
        if username == 'me' or not username:
            return self.request.user
        return get_object_or_404(CustomUser, username=username)

class UserPostsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        username = self.kwargs.get('username', None)
        if username == 'me' or not username:
            return Post.objects.filter(user=self.request.user).order_by('-created_at')
        user = get_object_or_404(CustomUser, username=username)
        return Post.objects.filter(user=user).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all().order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request):
    try:
        username = request.data.get('username')
        if not username:
            return Response(
                {'detail': 'Username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.username == username:
            return Response(
                {'detail': 'You cannot follow yourself'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user = get_object_or_404(CustomUser, username=username)
        follow = Follow.objects.filter(
            follower=request.user,
            following=target_user
        ).first()

        if follow:
            follow.delete()
            return Response(
                {'detail': f'Unfollowed {username}'}, 
                status=status.HTTP_200_OK
            )
        else:
            Follow.objects.create(
                follower=request.user,
                following=target_user
            )
            return Response(
                {'detail': f'Following {username}'}, 
                status=status.HTTP_201_CREATED
            )
    except CustomUser.DoesNotExist:
        return Response(
            {'detail': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'detail': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_follow(request, username):
    if request.user.username == username:
        return Response({'detail': 'Cannot check follow status for yourself'}, status=status.HTTP_400_BAD_REQUEST)

    target_user = get_object_or_404(CustomUser, username=username)
    is_following = Follow.objects.filter(
        follower=request.user,
        following=target_user
    ).exists()

    return Response({'is_following': is_following}, status=status.HTTP_200_OK)

class UserFollowersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        username = self.kwargs.get('username', None)
        if username == 'me' or not username:
            user = self.request.user
        else:
            user = get_object_or_404(CustomUser, username=username)
        
        # Get all users who follow the target user
        followers = CustomUser.objects.filter(
            following__following=user
        ).distinct()

        # Add is_following field to each user
        for follower in followers:
            follower.is_following = Follow.objects.filter(
                follower=self.request.user,
                following=follower
            ).exists()

        return followers

class UserFollowingView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        username = self.kwargs.get('username', None)
        if username == 'me' or not username:
            user = self.request.user
        else:
            user = get_object_or_404(CustomUser, username=username)
        
        # Get all users who the target user follows
        following = CustomUser.objects.filter(
            followers__follower=user
        ).distinct()

        # Add is_following field to each user
        for followed_user in following:
            followed_user.is_following = Follow.objects.filter(
                follower=self.request.user,
                following=followed_user
            ).exists()

        return following

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('query', '')
        if not query:
            return Response([])

        users = CustomUser.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:10]  # Limit to 10 results

        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)



