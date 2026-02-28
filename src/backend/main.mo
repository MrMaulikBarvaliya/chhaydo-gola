import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

actor {
  type MenuItem = {
    id : Nat;
    name : Text;
    price1 : Nat;
    price2 : Nat;
  };

  type OrderItem = {
    menuItemId : Nat;
    menuItemName : Text;
    variantType : Nat;
    quantity : Nat;
    unitPrice : Nat;
    subtotal : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    tableNumber : Text;
    description : Text;
    statusCode : Nat;
    createdAt : Int;
    items : [OrderItem];
    totalAmount : Nat;
  };

  type DailySummary = {
    orderCount : Nat;
    totalRevenue : Nat;
  };

  let menuItems = Map.empty<Nat, MenuItem>();
  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  do {
    let initialMenu : [(Nat, MenuItem)] = [
      (1, {
        id = 1;
        name = "સળીવાળા ગોલા (કોઈપણ ફ્લેવર)";
        price1 = 20;
        price2 = 0;
      }),
      (2, {
        id = 2;
        name = "પ્લેન ગોલા (કોઈપણ ફ્લેવર)";
        price1 = 50;
        price2 = 0;
      }),
      (3, {
        id = 3;
        name = "રોજ મલાઈ";
        price1 = 50;
        price2 = 60;
      }),
      (4, {
        id = 4;
        name = "સ્ટ્રોબેરી મલાઈ";
        price1 = 50;
        price2 = 60;
      }),
      (5, {
        id = 5;
        name = "મેંગો મલાઈ";
        price1 = 50;
        price2 = 60;
      }),
      (6, {
        id = 6;
        name = "જામફળ મલાઈ";
        price1 = 60;
        price2 = 70;
      }),
      (7, {
        id = 7;
        name = "કાચી કેરી મલાઈ";
        price1 = 60;
        price2 = 70;
      }),
      (8, {
        id = 8;
        name = "ઓરેન્જ મલાઈ";
        price1 = 60;
        price2 = 70;
      }),
      (9, {
        id = 9;
        name = "કાલાખટ્ટા મલાઈ";
        price1 = 60;
        price2 = 70;
      }),
      (10, {
        id = 10;
        name = "બ્લુબેરી મલાઈ";
        price1 = 70;
        price2 = 80;
      }),
      (11, {
        id = 11;
        name = "બ્લેક કરન્ટ મલાઈ";
        price1 = 70;
        price2 = 80;
      }),
      (12, {
        id = 12;
        name = "ઓરેન્જ ચોકલેટ";
        price1 = 70;
        price2 = 80;
      }),
      (13, {
        id = 13;
        name = "ટોપરા મલાઈ";
        price1 = 70;
        price2 = 80;
      }),
      (14, {
        id = 14;
        name = "કાજુ દ્રાક્ષ મલાઈ";
        price1 = 90;
        price2 = 100;
      }),
      (15, {
        id = 15;
        name = "પાઈનએપલ મલાઈ";
        price1 = 90;
        price2 = 100;
      }),
      (16, {
        id = 16;
        name = "રાજવાડી મલાઈ";
        price1 = 100;
        price2 = 120;
      }),
      (17, {
        id = 17;
        name = "ચોકોબાર ચોકલેટ ચિપ્સ મલાઈ";
        price1 = 100;
        price2 = 120;
      }),
      (18, {
        id = 18;
        name = "માવા મલાઈ";
        price1 = 100;
        price2 = 120;
      }),
      (19, {
        id = 19;
        name = "પંચામૃત";
        price1 = 100;
        price2 = 120;
      }),
      (20, {
        id = 20;
        name = "સ્પે. મિક્સ ફ્લેવર";
        price1 = 130;
        price2 = 150;
      }),
      (21, {
        id = 21;
        name = "સ્પે. ફ્રૂટ મલાઈ ખજાના";
        price1 = 180;
        price2 = 200;
      }),
      (22, {
        id = 22;
        name = "સ્પે. છાપડો";
        price1 = 250;
        price2 = 250;
      }),
    ];
    for ((id, item) in initialMenu.values()) {
      menuItems.add(id, item);
    };
  };

  public query ({ caller }) func getMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  public shared ({ caller }) func createOrder(
    customerName : Text,
    tableNumber : Text,
    description : Text,
    items : [OrderItem],
  ) : async Nat {
    let totalAmount = items.foldLeft(
      0,
      func(acc, item) { acc + item.subtotal },
    );

    let newOrder : Order = {
      id = nextOrderId;
      customerName;
      tableNumber;
      description;
      statusCode = 0;
      createdAt = Time.now();
      items;
      totalAmount;
    };

    orders.add(nextOrderId, newOrder);

    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Nat) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customerName = order.customerName;
          tableNumber = order.tableNumber;
          description = order.description;
          statusCode = newStatus;
          createdAt = order.createdAt;
          items = order.items;
          totalAmount = order.totalAmount;
        };
        orders.add(orderId, updatedOrder);
      };
    };
    true;
  };

  public query ({ caller }) func getActiveOrders() : async [Order] {
    orders.values().toArray().filter(
      func(order) {
        order.statusCode == 0 or order.statusCode == 1 or order.statusCode == 2
      }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    orders.get(orderId);
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          customerName = order.customerName;
          tableNumber = order.tableNumber;
          statusCode = 4;
          description = order.description;
          createdAt = order.createdAt;
          items = order.items;
          totalAmount = order.totalAmount;
        };
        orders.add(orderId, updatedOrder);
      };
    };
    true;
  };

  public shared ({ caller }) func clearAllOrders() : async () {
    orders.clear();
    nextOrderId := 1;
  };

  public query ({ caller }) func getDailySummary(_dateString : Text) : async DailySummary {
    let currentOrders = orders.values().toArray();
    let filteredOrders = currentOrders.filter(
      func(order) {
        order.statusCode != 4;
      }
    );
    let totalRevenue = filteredOrders.foldLeft(
      0,
      func(acc, order) { acc + order.totalAmount },
    );
    {
      orderCount = filteredOrders.size();
      totalRevenue;
    };
  };
};
