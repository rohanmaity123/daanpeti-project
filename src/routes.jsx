import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import SiteLayout from "./layouts/SiteLayout";
import MainLayout from "./layouts/MainLayout";

import GuestGuard from "./guards/GuestGuard";
import UserGuard from "./guards/UserGuard";

import LoadingScreen from "./components/LoadingScreen";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import ForgetPass from "./views/auth/ForgetPass";
import VerifyAccountPassword from "./views/auth/ForgetPass/VerifyAccountPassword";
import LoginWithOtp from "./views/auth/Login/LoginWithOtp";
import Page404 from "./views/errors/Page404";
import HomePage from "./views/home/home";
import ItemDetailPage from "./views/home/product.details";
import MyItemsPage from "./views/home/myItems";
import PostItemPage from "./views/home/post.item";
import ProfilePage from "./views/home/profile";
import SupportPage from "./views/home/support";
import Terms from "./views/home/terms";
import Contact from "./views/home/contactUs";
import About from "./views/home/about";
import Privacy from "./views/home/privacy";
import FundUsagePage from "./views/home/fund-use";
import RewardsPage from "./views/home/rewards";
import CityPage from "./views/home/citypage";
import BlogPostPage from "./views/home/BlogPostPage";
import BlogListPage from "./views/home/BlogListPage";


// ==================
// Layout Wrappers
// ==================

const GuestLayout = () => (
  <GuestGuard>
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  </GuestGuard>
);

const UserLayout = () => (
  <UserGuard>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </UserGuard>
);


// ==================
// Main Routes
// ==================

export default function RenderRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-pass" element={<ForgetPass />} />
          <Route path="/otp-verification" element={<VerifyAccountPassword />} />
          <Route path="/login-with-otp" element={<LoginWithOtp />} />

        </Route>


        {/* ================= USER ROUTES ================= */}
        <Route element={<UserLayout />}>
          <Route path="/:city/free-items" element={<CityPage type="free" />} />
          <Route path="/:city/donate-items" element={<CityPage type="donate" />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/items/:itemId" element={<ItemDetailPage />} />
          <Route path="/my-items" element={<MyItemsPage />} />
          <Route path="/post-item" element={<PostItemPage />} />
          <Route path="/edit/:itemId" element={<PostItemPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/fund-usage" element={<FundUsagePage />} />
          <Route path="/rewards" element={<RewardsPage />} />
        </Route>


        {/* ================= 404 ================= */}
        <Route path="/404" element={<Page404 />} />
        <Route path="*" element={<Navigate to="/404" />} />

      </Routes>
    </Suspense>
  );
}