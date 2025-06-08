import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import CreatePost from '../pages/CreatePost';
import EditPost from '../pages/EditPost';
import CartDetail from '../components/Cart/CartDetail';
import Checkout from '../components/Checkout/Checkout';
import OrderList from '../components/Orders/OrderList';
import AddressForm from '../components/Address/AddressForm';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:postId" element={<EditPost />} />
        <Route path="/cart" element={<CartDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/address" element={<AddressForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 