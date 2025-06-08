from django.urls import path
from .views import *

urlpatterns = [
    path('cart/add/', AddToCartView.as_view()),
    path('cart/', CartDetailView.as_view()),
    path('cart/remove/', RemoveFromCartView.as_view()),
    path('checkout/', CheckoutView.as_view()),
    path('orders/', OrderListView.as_view()),
    path('address/', AddressCreateView.as_view()),
]
