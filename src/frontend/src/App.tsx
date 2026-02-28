import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Snowflake,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MenuItem, Order, OrderItem } from "./backend.d.ts";
import { useActor } from "./hooks/useActor";

// ─── Auth ──────────────────────────────────────────────────────────────────────

const USERS = [
  { username: "chhaydo1", password: "MBChhaydo2826" },
  { username: "chhaydo2", password: "ATChhaydo2826" },
  { username: "chhaydo3", password: "BBChhaydo2826" },
];

function LoginPage({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const user = USERS.find(
        (u) => u.username === username.trim() && u.password === password,
      );
      if (user) {
        onLogin(user.username);
      } else {
        setError("ખોટું નામ અથવા પાસવર્ડ");
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full gola-header-gradient flex items-center justify-center shadow-lg mb-4">
            <Snowflake className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground gujarati-text text-center">
            બરફ ડિશ ગોળા
          </h1>
          <p className="text-sm text-muted-foreground gujarati-text mt-1">
            ઓર્ડર મેનેજમેન્ટ સિસ્ટમ
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-lg p-6 animate-scale-in">
          <h2 className="text-lg font-bold text-foreground gujarati-text mb-5 text-center">
            લૉગિન
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="login-username"
                className="gujarati-text text-sm font-medium text-foreground"
              >
                વપરાશકર્તા નામ
              </Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                autoComplete="username"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="gujarati-text text-sm font-medium text-foreground"
              >
                પાસવર્ડ
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive gujarati-text text-center font-medium animate-slide-up">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 gola-header-gradient text-white font-display text-base hover:opacity-90 mt-2"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="gujarati-text">લૉગિન</span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} · Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  menuItemId: number;
  menuItemName: string;
  variantType: number; // 0 = dryfruit, 1 = dryfruitIcecream
  quantity: number;
  unitPrice: number;
}

type Tab = "menu" | "orders" | "history";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<number, string> = {
  0: "રાહ જુઓ",
  1: "બનાવી રહ્યા",
  2: "તૈયાર",
  3: "સર્વ",
  4: "રદ",
};

const STATUS_CLASSES: Record<number, string> = {
  0: "status-pending",
  1: "status-preparing",
  2: "status-ready",
  3: "status-served",
  4: "status-cancelled",
};

const VARIANT_LABELS = ["ડ્રાયફ્રૂટ", "ડ્રાયફ્રૂટ આઈ"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bn(n: number): bigint {
  return BigInt(n);
}

function num(b: bigint): number {
  return Number(b);
}

function timeAgo(createdAt: bigint): string {
  const ms = Date.now() - num(createdAt) / 1_000_000;
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "હમણાં";
  if (mins < 60) return `${mins} મિ. પહેલાં`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ક. ${mins % 60} મિ. પહેલાં`;
}

function formatTime(createdAt: bigint): string {
  const d = new Date(num(createdAt) / 1_000_000);
  return d.toLocaleTimeString("gu-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(createdAt: bigint): string {
  const d = new Date(num(createdAt) / 1_000_000);
  return d.toLocaleDateString("gu-IN");
}

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Menu Item Row ────────────────────────────────────────────────────────────

function MenuItemRow({
  item,
  index,
  onAddToCart,
}: {
  item: MenuItem;
  index: number;
  onAddToCart: (item: MenuItem, variant: number, price: number) => void;
}) {
  const price1 = num(item.price1);
  const price2 = num(item.price2);
  const isEven = index % 2 === 0;

  return (
    <tr
      className={`${isEven ? "menu-row-even" : "menu-row-odd"} transition-colors`}
    >
      <td className="py-2.5 px-3 text-sm font-medium text-foreground gujarati-text border-b border-border/40">
        <span className="flex items-center gap-1.5">
          <Snowflake className="w-3 h-3 text-primary/50 shrink-0" />
          {item.name}
        </span>
      </td>
      <td className="py-2.5 px-3 text-center border-b border-border/40 border-l border-l-border/20">
        {price1 > 0 ? (
          <button
            type="button"
            onClick={() => onAddToCart(item, 0, price1)}
            className="price-cell-hover inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 active:scale-95"
          >
            <Plus className="w-3 h-3" />₹{price1}
          </button>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-center border-b border-border/40 border-l border-l-border/20">
        {price2 > 0 ? (
          <button
            type="button"
            onClick={() => onAddToCart(item, 1, price2)}
            className="price-cell-hover inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-accent/20 text-foreground font-bold text-sm hover:bg-accent/30 active:scale-95"
          >
            <Plus className="w-3 h-3" />₹{price2}
          </button>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Cart Sheet ───────────────────────────────────────────────────────────────

function CartSheet({
  open,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  onPlaceOrder,
  isPlacing,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (idx: number, delta: number) => void;
  onRemove: (idx: number) => void;
  onPlaceOrder: (
    customerName: string,
    tableNumber: string,
    description: string,
  ) => void;
  isPlacing: boolean;
}) {
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderDescription, setOrderDescription] = useState("");

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const handleSubmit = () => {
    if (!customerName.trim()) {
      toast.error("કૃપા કરી ગ્રાહકનું નામ દાખલ કરો");
      return;
    }
    if (cart.length === 0) {
      toast.error("કૃપા કરી કંઈક ઉમેરો");
      return;
    }
    onPlaceOrder(
      customerName.trim(),
      tableNumber.trim(),
      orderDescription.trim(),
    );
    setCustomerName("");
    setTableNumber("");
    setOrderDescription("");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gola-header-gradient">
          <SheetTitle className="text-white font-display text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            કાર્ટ ({cart.length} આઇટમ)
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-3">
              <ShoppingCart className="w-12 h-12 opacity-25" />
              <p className="gujarati-text text-sm">કાર્ટ ખાલી છે</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.menuItemId}-${item.variantType}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 animate-slide-up"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate gujarati-text text-foreground">
                    {item.menuItemName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {VARIANT_LABELS[item.variantType]} · ₹{item.unitPrice}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(idx, -1)}
                    className="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(idx, 1)}
                    className="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right min-w-[52px]">
                  <p className="text-sm font-bold text-primary">
                    ₹{item.unitPrice * item.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span className="gujarati-text text-foreground">કુલ</span>
              <span className="text-primary text-2xl">₹{total}</span>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label
                  htmlFor="customer-name"
                  className="gujarati-text text-sm font-medium"
                >
                  ગ્રાહકનું નામ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-name"
                  placeholder="નામ દાખલ કરો"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="gujarati-text"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="table-number"
                  className="gujarati-text text-sm font-medium"
                >
                  ટેબલ નંબર (વૈકલ્પિક)
                </Label>
                <Input
                  id="table-number"
                  placeholder="જેમ કે: T1, T2"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="order-description"
                  className="gujarati-text text-sm font-medium"
                >
                  વર્ણન (વૈકલ્પિક)
                </Label>
                <Input
                  id="order-description"
                  placeholder="ઓર્ડર વિશે વધારાની માહિતી"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  className="gujarati-text"
                />
              </div>
            </div>

            <SheetFooter>
              <Button
                className="w-full font-display text-base h-11 gola-header-gradient text-white hover:opacity-90"
                onClick={handleSubmit}
                disabled={isPlacing}
              >
                {isPlacing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ઓર્ડર મૂકી રહ્યા...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ઓર્ડર કરો · ₹{total}
                  </>
                )}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onAdvance,
  onCancel,
  isUpdating,
}: {
  order: Order;
  onAdvance: (orderId: bigint, newStatus: number) => void;
  onCancel: (orderId: bigint) => void;
  isUpdating: boolean;
}) {
  const status = num(order.statusCode);
  const canAdvance = status < 3;
  const canCancel = status < 3;

  const nextStatusLabel: Record<number, string> = {
    0: "બનાવવાનું શરૂ",
    1: "તૈયાર",
    2: "સર્વ",
  };

  return (
    <div className="bg-card rounded-2xl gola-card-shadow border border-border/60 overflow-hidden animate-scale-in">
      {/* Order header */}
      <div className="gola-header-gradient px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold font-display text-sm">
              ઓર્ડર #{num(order.id)}
            </p>
            <p className="text-white/70 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(order.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASSES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Customer & table info */}
      <div className="px-4 pt-3 pb-2 border-b border-border/40">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {order.customerName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-foreground gujarati-text">
              {order.customerName}
            </span>
          </div>
          {order.tableNumber && (
            <span className="text-xs bg-accent/20 text-foreground px-2 py-0.5 rounded-full font-medium">
              ટેબલ: {order.tableNumber}
            </span>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="px-4 py-2 space-y-1">
        {order.items.map((item, idx) => (
          <div
            key={`${num(item.menuItemId)}-${num(item.variantType)}-${idx}`}
            className="flex items-center justify-between text-sm py-1"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-primary font-bold text-xs bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                {num(item.quantity)}
              </span>
              <span className="text-foreground gujarati-text truncate text-sm">
                {item.menuItemName}
              </span>
              <span className="text-muted-foreground text-xs shrink-0">
                ({VARIANT_LABELS[num(item.variantType)]})
              </span>
            </div>
            <span className="text-foreground font-semibold ml-2 shrink-0 text-sm">
              ₹{num(item.subtotal)}
            </span>
          </div>
        ))}
        {order.description && (
          <p className="text-xs italic text-muted-foreground gujarati-text pt-1 border-t border-border/30 mt-1">
            {order.description}
          </p>
        )}
      </div>

      {/* Total & actions */}
      <div className="px-4 pb-4 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground gujarati-text">
            કુલ
          </span>
          <span className="text-xl font-bold text-primary">
            ₹{num(order.totalAmount)}
          </span>
        </div>
        <div className="flex gap-2">
          {canAdvance && (
            <Button
              size="sm"
              className="flex-1 text-xs h-8 gola-header-gradient text-white hover:opacity-90"
              onClick={() => onAdvance(order.id, status + 1)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  {status === 0 && <ChefHat className="w-3 h-3 mr-1" />}
                  {status === 1 && <CheckCircle className="w-3 h-3 mr-1" />}
                  {status === 2 && <UtensilsCrossed className="w-3 h-3 mr-1" />}
                  {nextStatusLabel[status]}
                </>
              )}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
              onClick={() => onCancel(order.id)}
              disabled={isUpdating}
            >
              <XCircle className="w-3 h-3 mr-1" />
              રદ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

function MenuTab({
  onOpenCart,
  cartCount,
  cart,
  onUpdateQty,
  onRemove,
  onPlaceOrder,
  isPlacing,
}: {
  onOpenCart: () => void;
  cartCount: number;
  cart: CartItem[];
  onUpdateQty: (idx: number, delta: number) => void;
  onRemove: (idx: number) => void;
  onPlaceOrder: (name: string, table: string, description: string) => void;
  isPlacing: boolean;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const { actor, isFetching } = useActor();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor && !isFetching,
  });

  const _handleOpenCart = () => {
    setCartOpen(true);
    onOpenCart();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Menu table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
              <Skeleton key={k} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="gola-header-gradient sticky top-0 z-10">
                  <th className="py-3 px-3 text-left text-white font-bold gujarati-text text-sm">
                    આઇટમ
                  </th>
                  <th className="py-3 px-3 text-center text-white font-bold text-xs">
                    ડ્રાયફ્રૂટ
                  </th>
                  <th className="py-3 px-3 text-center text-white font-bold text-xs">
                    ડ્રાયફ્રૂટ આઈ
                  </th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, idx) => (
                  <MenuItemRow
                    key={num(item.id)}
                    item={item}
                    index={idx}
                    onAddToCart={(menuItem, variant, price) => {
                      // Direct call to parent's addToCart
                      const cartItem: CartItem = {
                        menuItemId: num(menuItem.id),
                        menuItemName: menuItem.name,
                        variantType: variant,
                        quantity: 1,
                        unitPrice: price,
                      };
                      // We bubble via a custom event approach — but here it's cleaner
                      // to just call the prop. We'll wire this at the App level.
                      window.dispatchEvent(
                        new CustomEvent("add-to-cart", { detail: cartItem }),
                      );
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gola-header-gradient shadow-lg flex items-center justify-center text-white transition-transform active:scale-95 hover:scale-105"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-foreground text-xs font-bold">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
        onPlaceOrder={(name, table, desc) => {
          onPlaceOrder(name, table, desc);
          setCartOpen(false);
        }}
        isPlacing={isPlacing}
      />
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    dataUpdatedAt,
  } = useQuery<Order[]>({
    queryKey: ["activeOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: { orderId: bigint; newStatus: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateOrderStatus(orderId, bn(newStatus));
    },
    onSuccess: (_, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      const statusLabels: Record<number, string> = {
        1: "બનાવી રહ્યા",
        2: "તૈયાર",
        3: "સર્વ",
        4: "રદ",
      };
      toast.success(`સ્ટેટસ: ${statusLabels[newStatus] ?? "અપડેટ"}`);
    },
    onError: () => toast.error("સ્ટેટસ અપડેટ ન થઈ શક્યો"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      toast.success("ઓર્ડર રદ કરવામાં આવ્યો");
    },
    onError: () => toast.error("ઓર્ડર રદ ન થઈ શક્યો"),
  });

  // Group by status for display ordering
  const grouped: Record<number, Order[]> = { 0: [], 1: [], 2: [] };
  for (const o of orders) {
    const s = num(o.statusCode);
    if (s < 3) grouped[s]?.push(o);
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("gu-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const totalActive = orders.filter((o) => num(o.statusCode) < 3).length;

  return (
    <div className="flex-1 overflow-auto pb-24">
      {/* Stats bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="gujarati-text text-muted-foreground">
              સક્રિય ઓર્ડર:
            </span>
            <span className="font-bold text-primary">{totalActive}</span>
          </div>
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_CLASSES[s]}`}
            >
              {STATUS_LABELS[s]}: {grouped[s].length}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["activeOrders"] })
          }
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          {lastUpdated}
        </button>
      </div>

      {isLoading ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {["o1", "o2", "o3"].map((k) => (
            <Skeleton key={k} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : totalActive === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 opacity-30" />
          </div>
          <p className="gujarati-text text-base font-medium">
            કોઈ સક્રિય ઓર્ડર નથી
          </p>
          <p className="text-sm text-muted-foreground">
            Menu ટેબ પર જઈ ઓર્ડર ઉમેરો
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {[0, 1, 2].map((statusGroup) =>
            grouped[statusGroup].length > 0 ? (
              <div key={statusGroup}>
                <h3 className="text-xs font-bold uppercase tracking-wider px-1 mb-3 flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      statusGroup === 0
                        ? "bg-amber-400"
                        : statusGroup === 1
                          ? "bg-blue-400"
                          : "bg-green-400"
                    }`}
                  />
                  <span className="gujarati-text text-muted-foreground">
                    {STATUS_LABELS[statusGroup]} ({grouped[statusGroup].length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[statusGroup].map((order, i) => (
                    <div
                      key={num(order.id)}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <OrderCard
                        order={order}
                        onAdvance={(id, newStatus) =>
                          updateMutation.mutate({ orderId: id, newStatus })
                        }
                        onCancel={(id) => cancelMutation.mutate(id)}
                        isUpdating={
                          updateMutation.isPending || cancelMutation.isPending
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab() {
  const { actor, isFetching } = useActor();
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [confirmClear, setConfirmClear] = useState(false);
  const queryClient = useQueryClient();

  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.clearAllOrders();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      setConfirmClear(false);
      toast.success("બધા ઓર્ડર સાફ કરવામાં આવ્યા");
    },
    onError: () => {
      setConfirmClear(false);
      toast.error("ઓર્ડર સાફ ન થઈ શક્યા");
    },
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dailySummary", selectedDate],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDailySummary(selectedDate);
    },
    enabled: !!actor && !isFetching,
  });

  const pastOrders = allOrders
    .filter((o) => {
      if (num(o.statusCode) < 3) return false;
      const orderDate = new Date(num(o.createdAt) / 1_000_000)
        .toISOString()
        .split("T")[0];
      return orderDate === selectedDate;
    })
    .sort((a, b) => num(b.createdAt) - num(a.createdAt));

  return (
    <div className="flex-1 overflow-auto pb-24">
      {/* Summary card */}
      <div className="p-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden gola-card-shadow">
          <div className="gola-header-gradient px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-display font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              દૈનિક સારાંશ
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-md px-2 py-1">
                <CalendarDays className="w-3.5 h-3.5 text-white/80" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={todayDateString()}
                  className="text-xs bg-transparent text-white border-none outline-none cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  const next = d.toISOString().split("T")[0];
                  if (next <= todayDateString()) setSelectedDate(next);
                }}
                disabled={selectedDate >= todayDateString()}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              {summaryLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-primary font-display">
                    {summary ? num(summary.orderCount) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 gujarati-text">
                    કુલ ઓર્ડર
                  </p>
                </>
              )}
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-xl">
              {summaryLoading ? (
                <Skeleton className="h-8 w-24 mx-auto" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-primary font-display">
                    ₹{summary ? num(summary.totalRevenue) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 gujarati-text">
                    કુલ આવક
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Orders list */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h3 className="text-sm font-bold text-foreground gujarati-text">
                ઓર્ડર ઇતિહાસ
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDate === todayDateString()
                  ? "આજના ઓર્ડર"
                  : new Date(selectedDate).toLocaleDateString("gu-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </p>
            </div>
            {pastOrders.length > 0 && !confirmClear && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors gujarati-text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                સાફ કરો
              </button>
            )}
            {confirmClear && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground gujarati-text">
                  ખાતરી છે?
                </span>
                <button
                  type="button"
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="flex items-center gap-1 text-xs font-semibold bg-destructive text-destructive-foreground px-2.5 py-1 rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors gujarati-text"
                >
                  {clearMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  હા, સાફ કરો
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  disabled={clearMutation.isPending}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg transition-colors gujarati-text"
                >
                  રદ
                </button>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {["h1", "h2", "h3", "h4"].map((k) => (
                <Skeleton key={k} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <Package className="w-10 h-10 opacity-25" />
              <p className="gujarati-text text-sm">કોઈ ઇતિહાસ નથી</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastOrders.map((order, i) => {
                const status = num(order.statusCode);
                return (
                  <div
                    key={num(order.id)}
                    className="bg-card rounded-xl border border-border/50 p-4 animate-slide-up"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground font-display">
                            #{num(order.id)}
                          </span>
                          <span className="gujarati-text text-sm font-semibold text-foreground">
                            {order.customerName}
                          </span>
                          {order.tableNumber && (
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              ટ. {order.tableNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.createdAt)} ·{" "}
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[status]}`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                        <span className="text-base font-bold text-primary">
                          ₹{num(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span
                          key={`hist-item-${num(item.menuItemId)}-${num(item.variantType)}-${idx}`}
                          className="text-xs bg-muted/60 text-foreground px-2 py-0.5 rounded-full gujarati-text"
                        >
                          {num(item.quantity)}× {item.menuItemName}
                        </span>
                      ))}
                    </div>
                    {order.description && (
                      <p className="text-xs italic text-muted-foreground gujarati-text mt-1.5">
                        {order.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // Listen for add-to-cart events from MenuItemRow
  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<CartItem>).detail;
      setCart((prev) => {
        const existing = prev.findIndex(
          (c) =>
            c.menuItemId === item.menuItemId &&
            c.variantType === item.variantType,
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = {
            ...updated[existing],
            quantity: updated[existing].quantity + 1,
          };
          return updated;
        }
        return [...prev, item];
      });
      toast.success(`${item.menuItemName} ઉમેર્યું`, {
        description: `${VARIANT_LABELS[item.variantType]} · ₹${item.unitPrice}`,
        duration: 1500,
      });
    };
    window.addEventListener("add-to-cart", handler);
    return () => window.removeEventListener("add-to-cart", handler);
  }, []);

  const handleUpdateQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...updated[idx], quantity: newQty };
      }
      return updated;
    });
  };

  const handleRemove = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const placeMutation = useMutation({
    mutationFn: async ({
      customerName,
      tableNumber,
      description,
    }: {
      customerName: string;
      tableNumber: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const items: OrderItem[] = cart.map((c) => ({
        menuItemId: bn(c.menuItemId),
        menuItemName: c.menuItemName,
        variantType: bn(c.variantType),
        quantity: bn(c.quantity),
        unitPrice: bn(c.unitPrice),
        subtotal: bn(c.quantity * c.unitPrice),
      }));
      return actor.createOrder(customerName, tableNumber, description, items);
    },
    onSuccess: (orderId) => {
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      toast.success(`ઓર્ડર #${num(orderId)} સફળ!`, {
        description: "ઓર્ડર ટેબ પર જઈ સ્ટેટસ ટ્રૅક કરો",
        duration: 4000,
      });
      setActiveTab("orders");
    },
    onError: () => {
      toast.error("ઓર્ડર ન થઈ શક્યો", {
        description: "ફરી પ્રયાસ કરો",
      });
    },
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Show login page if not logged in (after all hooks)
  if (!isLoggedIn) {
    return (
      <>
        <Toaster richColors position="top-center" />
        <LoginPage
          onLogin={(u) => {
            setLoggedInUser(u);
            setIsLoggedIn(true);
          }}
        />
      </>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "menu", label: "મેનૂ", icon: <Snowflake className="w-4 h-4" /> },
    {
      id: "orders",
      label: "ઓર્ડર",
      icon: (
        <div className="relative">
          <Package className="w-4 h-4" />
        </div>
      ),
    },
    {
      id: "history",
      label: "ઇતિહાસ",
      icon: <CalendarDays className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-4xl mx-auto">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-30 gola-header-gradient shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-display font-bold text-lg leading-tight gujarati-text">
                બરફ ડિશ ગોળા
              </h1>
              <p className="text-white/70 text-xs gujarati-text">ઓર્ડર મેનેજમેન્ટ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "menu" && cartTotal > 0 && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <ShoppingCart className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">
                  {cartTotal}
                </span>
                <span className="text-white/70 text-xs gujarati-text">
                  ₹{cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0)}
                </span>
              </div>
            )}
            {isFetching && (
              <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
            )}
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false);
                setLoggedInUser("");
                setCart([]);
              }}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              title="Logout"
            >
              <span className="max-w-[80px] truncate hidden sm:inline">
                {loggedInUser}
              </span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "menu" && (
          <MenuTab
            onOpenCart={() => {}}
            cartCount={cartTotal}
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onPlaceOrder={(name, table, desc) =>
              placeMutation.mutate({
                customerName: name,
                tableNumber: table,
                description: desc,
              })
            }
            isPlacing={placeMutation.isPending}
          />
        )}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "history" && <HistoryTab />}
      </main>

      {/* Bottom tab navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-40 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  activeTab === tab.id ? "scale-110" : "scale-100"
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-xs font-medium gujarati-text ${
                  activeTab === tab.id ? "font-bold" : ""
                }`}
              >
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="pb-20 pt-2 text-center text-xs text-muted-foreground bg-background">
        © 2026 · Built with ❤️ using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
