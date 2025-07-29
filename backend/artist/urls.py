from django.urls import path
from .views import (
    PostListCreateView, PostDetailView,
    SavePostListCreateView, SavePostDetailView,
    LikePostListCreateView, LikePostDetailView,
    CommentListCreateView, CommentDetailView,
    FollowListCreateView, FollowDetailView,
    UserActivityView, login, register, get_user_data,
    UserFollowersView, UserFollowingView, UserSearchView
)
from . import views

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('save-posts/', SavePostListCreateView.as_view(), name='save-post-list-create'),
    path('save-posts/<int:pk>/', SavePostDetailView.as_view(), name='save-post-detail'),
    path('like-posts/', LikePostListCreateView.as_view(), name='like-post-list-create'),
    path('like-posts/<int:pk>/', LikePostDetailView.as_view(), name='like-post-detail'),
    path('comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('follows/list/', FollowListCreateView.as_view(), name='follow-list-create'),
    path('follows/<int:pk>/', FollowDetailView.as_view(), name='follow-detail'),
    path('user-activity/', UserActivityView.as_view(), name='user-activity'),
    path('user-activity/<str:username>/', UserActivityView.as_view(), name='user-activity-detail'),
    path('login/', login, name='login'),
    path('register/', register, name='register'),
    path('me/', get_user_data, name='user-data'),
    path('users/<str:username>/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/<str:username>/posts/', views.UserPostsView.as_view(), name='user-posts'),
    path('users/<str:username>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('users/<str:username>/following/', UserFollowingView.as_view(), name='user-following'),
    path('users/search/', UserSearchView.as_view(), name='user-search'),
    path('follows/toggle/', views.follow_user, name='follow-user'),
    path('follows/check/<str:username>/', views.check_follow, name='check-follow'),
]