import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, User, Store, LogOut, Package, Heart, ChevronDown, Coins, Home, Search } from 'lucide-react';
import { useAppContext, CURRENCIES } from '../store';
import { mockCategories } from '../mockData';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { SearchAutocomplete } from './SearchAutocomplete';
import { ProductComparisonBar } from './ProductComparisonModal';

export function Layout() {
  const { user, cart, setUser, currency, setCurrency, currencyInfo } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-x-hidden pb-16 md:pb-0">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-tight">
              IndeMarket
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl px-8">
            <SearchAutocomplete />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Currency Selector Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all border border-gray-200/80 shadow-2xs"
                title="Change display currency"
              >
                <span className="text-sm leading-none">{currencyInfo.flag}</span>
                <span className="font-bold">{currencyInfo.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute right-0 w-44 mt-1.5 py-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 divide-y divide-gray-50">
                <div className="px-3.5 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Select Currency
                </div>
                <div className="py-1">
                  {Object.values(CURRENCIES).map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                        currency === curr.code
                          ? 'bg-indigo-50 font-extrabold text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{curr.flag}</span>
                        <span>{curr.code}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono font-semibold">{curr.symbol.trim()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 z-50">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <Package className="w-4 h-4" /> {user.role === 'seller' ? 'Customer Orders' : 'My Orders'}
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <Heart className="w-4 h-4" /> My Wishlist
                  </Link>
                  {user.role === 'seller' ? (
                    <Link to="/seller/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                      <Store className="w-4 h-4 text-indigo-600" /> Seller Dashboard
                    </Link>
                  ) : (
                    <Link to="/become-seller" className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50">
                      <Store className="w-4 h-4 text-indigo-600" /> Become a Seller
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-4 pt-3 pb-4 space-y-4">
            <SearchAutocomplete 
              placeholder="Search products..." 
              onSearchSubmitted={() => setIsMobileMenuOpen(false)} 
            />
            
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Explore Categories</span>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-3">
                {mockCategories.map((category) => (
                  <Link 
                    key={category.name} 
                    to={`/search?category=${encodeURIComponent(category.name)}`} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-xs text-gray-700 hover:text-indigo-600 font-medium py-1.5 px-2 bg-gray-50 rounded-lg truncate"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Currency Picker */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-indigo-600" /> Currency
              </span>
              <div className="flex items-center gap-1">
                {Object.values(CURRENCIES).map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      currency === curr.code
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {curr.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium py-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium py-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400" /> {user.role === 'seller' ? 'Customer Orders' : 'My Orders'}
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium py-2 text-sm">
                    <Heart className="w-4 h-4 text-gray-400" /> My Wishlist
                  </Link>
                  {user.role === 'seller' ? (
                    <Link to="/seller/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium py-2 text-sm">
                      <Store className="w-4 h-4 text-gray-400" /> Seller Dashboard
                    </Link>
                  ) : (
                    <Link to="/become-seller" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-indigo-600 font-bold py-2 text-sm">
                      <Store className="w-4 h-4 text-indigo-600" /> Become a Seller
                    </Link>
                  )}
                  <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-red-600 font-medium py-2 text-sm text-left">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-indigo-600 font-bold py-2 text-sm">
                    <User className="w-4 h-4" /> Sign In / Register
                  </Link>
                  <Link to="/become-seller" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-indigo-600 font-bold py-2 text-sm">
                    <Store className="w-4 h-4" /> Become a Seller
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Floating Product Comparison Bar */}
      <ProductComparisonBar />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-2 flex justify-around items-center shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            location.pathname === '/' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            location.pathname === '/search' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>

        <Link
          to="/wishlist"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            location.pathname === '/wishlist' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Wishlist</span>
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            location.pathname === '/cart' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {cartItemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>

        <Link
          to={user ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            location.pathname === '/profile' || location.pathname === '/login' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{user ? 'Account' : 'Sign In'}</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start mb-6 md:mb-0">
              <span className="text-xl font-bold text-gray-900 tracking-tight">IndeMarket</span>
            </div>
            <div className="flex justify-center space-x-6">
              <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900">About</Link>
              <Link to="/support" className="text-sm text-gray-500 hover:text-gray-900">Support</Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms</Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-8 md:flex md:items-center md:justify-between">
            <p className="text-base text-gray-400 text-center md:text-left">
              &copy; 2026 IndeMarket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
