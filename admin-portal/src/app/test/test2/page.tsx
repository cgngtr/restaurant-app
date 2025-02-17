"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRestaurantId } from "@/lib/hooks/useRestaurantId";
import { useUser } from "@/lib/hooks/useUser";
import {
  StockItem,
  Supplier,
  getStockItems,
  getSuppliers,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  createStockTransaction
} from "@/lib/api/stock";

const StockManagementPage = () => {
  const { toast } = useToast();
  const restaurantId = useRestaurantId();
  const { user } = useUser();

  const [items, setItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<StockItem | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, number>>({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    supplier_id: "",
    unit: "",
    quantity: "0",
    minimum_quantity: "0",
    maximum_quantity: "",
    unit_cost: "",
    last_ordered_at: null,
    last_received_at: null,
  });

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  const loadData = async () => {
    try {
      const [itemsData, suppliersData] = await Promise.all([
        getStockItems(restaurantId!),
        getSuppliers(restaurantId!)
      ]);

      setItems(itemsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load stock data",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      const productToAdd = {
        ...newProduct,
        quantity: Number(newProduct.quantity),
        minimum_quantity: Number(newProduct.minimum_quantity),
        maximum_quantity: newProduct.maximum_quantity ? Number(newProduct.maximum_quantity) : null,
        unit_cost: newProduct.unit_cost ? Number(newProduct.unit_cost) : null,
      };

      const result = await createStockItem(restaurantId!, productToAdd);
      
      // Create initial stock transaction
      if (productToAdd.quantity > 0) {
        await createStockTransaction(restaurantId!, user!.id, {
          stock_item_id: result.id,
          supplier_id: productToAdd.supplier_id,
          transaction_type: "received",
          quantity: productToAdd.quantity,
          unit_cost: productToAdd.unit_cost,
          notes: "Initial stock entry",
        });
      }

      setIsAddDialogOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        description: "",
        supplier_id: "",
        unit: "",
        quantity: "0",
        minimum_quantity: "0",
        maximum_quantity: "",
        unit_cost: "",
        last_ordered_at: null,
        last_received_at: null,
      });
      
      loadData();
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async () => {
    if (!editProduct) return;

    try {
      const updatedProduct = {
        ...editProduct,
        quantity: Number(editProduct.quantity),
        minimum_quantity: Number(editProduct.minimum_quantity),
        maximum_quantity: editProduct.maximum_quantity ? Number(editProduct.maximum_quantity) : null,
        unit_cost: editProduct.unit_cost ? Number(editProduct.unit_cost) : null,
      };

      await updateStockItem(editProduct.id, updatedProduct);
      
      setIsEditDialogOpen(false);
      setEditProduct(null);
      loadData();
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteStockItem(id);
      loadData();
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Add debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced update function
  const debouncedUpdateQuantity = debounce(async (itemId: string, newQuantity: number, oldQuantity: number) => {
    try {
      const difference = newQuantity - oldQuantity;
      
      // Update stock item quantity
      await updateStockItem(itemId, { quantity: newQuantity });
      
      // Create transaction record
      await createStockTransaction(restaurantId!, user!.id, {
        stock_item_id: itemId,
        supplier_id: null,
        transaction_type: "adjusted",
        quantity: difference,
        unit_cost: null,
        notes: "Manual quantity adjustment",
      });

      // Remove from pending updates
      setPendingUpdates(prev => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: "Success",
        description: "Quantity updated successfully",
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      
      // Revert the local state on error
      setItems(items => items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: oldQuantity }
          : item
      ));
      
      // Remove from pending updates
      setPendingUpdates(prev => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  }, 1000);

  const handleQuantityChange = (item: StockItem, newQuantity: number) => {
    // Update local state immediately
    setItems(items => items.map(i => 
      i.id === item.id 
        ? { ...i, quantity: newQuantity }
        : i
    ));
    
    // Add to pending updates
    setPendingUpdates(prev => ({
      ...prev,
      [item.id]: newQuantity
    }));
    
    // Trigger debounced update
    debouncedUpdateQuantity(item.id, newQuantity, item.quantity);
  };

  const filteredProducts = items.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter(item => item.quantity <= item.minimum_quantity).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {items.filter(item => item.quantity === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Min. Quantity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className={
                product.quantity === 0
                  ? "bg-red-50"
                  : product.quantity <= product.minimum_quantity
                  ? "bg-yellow-50"
                  : ""
              }>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.supplier?.company_name}</TableCell>
                <TableCell>
                  <div className="relative">
                    <Input
                      type="number"
                      value={pendingUpdates[product.id] ?? product.quantity}
                      onChange={(e) => handleQuantityChange(product, Number(e.target.value))}
                      className={`w-20 ${pendingUpdates[product.id] ? 'bg-blue-50' : ''}`}
                    />
                    {pendingUpdates[product.id] && (
                      <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                        <div className="animate-spin h-3 w-3 border-2 border-blue-500 rounded-full border-t-transparent" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.minimum_quantity}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditProduct(product);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={newProduct.sku}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, sku: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={newProduct.supplier_id}
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, supplier_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={newProduct.unit}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minimum_quantity">Minimum Quantity</Label>
                <Input
                  id="minimum_quantity"
                  type="number"
                  value={newProduct.minimum_quantity}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      minimum_quantity: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maximum_quantity">Maximum Quantity</Label>
                <Input
                  id="maximum_quantity"
                  type="number"
                  value={newProduct.maximum_quantity}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      maximum_quantity: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit_cost">Unit Cost</Label>
              <Input
                id="unit_cost"
                type="number"
                value={newProduct.unit_cost}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, unit_cost: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={editProduct.sku || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, sku: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editProduct.description || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Select
                  value={editProduct.supplier_id || ""}
                  onValueChange={(value) =>
                    setEditProduct({ ...editProduct, supplier_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={editProduct.unit}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, unit: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-minimum_quantity">Minimum Quantity</Label>
                  <Input
                    id="edit-minimum_quantity"
                    type="number"
                    value={editProduct.minimum_quantity}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        minimum_quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maximum_quantity">Maximum Quantity</Label>
                  <Input
                    id="edit-maximum_quantity"
                    type="number"
                    value={editProduct.maximum_quantity || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        maximum_quantity: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unit_cost">Unit Cost</Label>
                <Input
                  id="edit-unit_cost"
                  type="number"
                  value={editProduct.unit_cost || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      unit_cost: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagementPage;
