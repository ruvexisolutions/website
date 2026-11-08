"use client";

import React, { useState } from "react";
import { useRuvexi } from "@/lib/ruvexi-context";
import { formatCurrency } from "@/lib/utils";
import { InventoryItem } from "@/lib/types";
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Boxes,
  Tag,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export function InventoryView() {
  const { inventory, updateStock, restockItem, addInventoryItem } = useRuvexi();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [usageFilter, setUsageFilter] = useState<"All" | "Salon Professional" | "Retail Sale">("All");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals
  const [restockModalItem, setRestockModalItem] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemBrand, setNewItemBrand] = useState("");
  const [newItemSku, setNewItemSku] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<any>("Hair Care");
  const [newItemUsage, setNewItemUsage] = useState<any>("Salon Professional");
  const [newItemCurrentStock, setNewItemCurrentStock] = useState(10);
  const [newItemMinThreshold, setNewItemMinThreshold] = useState(5);
  const [newItemCostPrice, setNewItemCostPrice] = useState(850);
  const [newItemRetailPrice, setNewItemRetailPrice] = useState(1400);
  const [newItemUnit, setNewItemUnit] = useState("Bottles");

  // Filtered Items
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesUsage = usageFilter === "All" || item.usageType === usageFilter;
    const matchesLowStock = onlyLowStock ? item.currentStock <= item.minThreshold : true;

    return matchesSearch && matchesCategory && matchesUsage && matchesLowStock;
  });

  // Analytics
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;
  const totalValuation = inventory.reduce((acc, i) => acc + i.currentStock * i.costPrice, 0);
  const retailPotentialValue = inventory
    .filter((i) => i.usageType === "Retail Sale" && i.retailPrice)
    .reduce((acc, i) => acc + i.currentStock * (i.retailPrice || 0), 0);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalItem && restockQuantity > 0) {
      restockItem(restockModalItem.id, restockQuantity);
      setRestockModalItem(null);
      setRestockQuantity(10);
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addInventoryItem({
      name: newItemName,
      brand: newItemBrand || "Luxe Salon",
      sku: newItemSku || `SKU-${Date.now().toString().slice(-5)}`,
      category: newItemCategory,
      usageType: newItemUsage,
      currentStock: newItemCurrentStock,
      minThreshold: newItemMinThreshold,
      costPrice: newItemCostPrice,
      retailPrice: newItemUsage === "Retail Sale" ? newItemRetailPrice : undefined,
      unit: newItemUnit,
    });

    setShowAddModal(false);
    setNewItemName("");
    setNewItemBrand("");
    setNewItemSku("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                Floor Stock & Retail Inventory
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                Multi-Bin Ledger
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Professional salon backbar usage • Retail shelves ledger • Dynamic reorder threshold alerts
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product SKU
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest">Total Active SKUs</span>
            <span className="p-2 bg-[#181818] text-[#FACC15] rounded-lg border border-[#27272A]">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#F8FAFC] mt-2">{inventory.length} Products</div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">Across 4 luxury categories</p>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest">Reorder Alerts</span>
            <span className="p-2 bg-[#181818] text-rose-400 rounded-lg border border-[#27272A]">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-2">{lowStockCount} Critical</div>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className="text-[11px] text-rose-400 hover:underline font-mono mt-1 block cursor-pointer"
          >
            {onlyLowStock ? "Show all items" : "Filter below threshold →"}
          </button>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest">Wholesale Cost Basis</span>
            <span className="p-2 bg-[#181818] text-[#FACC15] rounded-lg border border-[#27272A]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#FACC15] mt-2">{formatCurrency(totalValuation)}</div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">Total physical stock value</p>
        </div>

        <div className="bg-[#151515] border border-[#27272A] p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest">Retail Shelf Potential</span>
            <span className="p-2 bg-[#181818] text-emerald-400 rounded-lg border border-[#27272A]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-2">{formatCurrency(retailPotentialValue)}</div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">Projected customer revenue</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#101010] border border-[#27272A] p-4 rounded-xl space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search product name, brand or SKU (e.g. Olaplex, Moroccanoil, Wella)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={usageFilter}
              onChange={(e: any) => setUsageFilter(e.target.value)}
              className="px-3.5 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
            >
              <option value="All" className="bg-[#151515] text-[#F8FAFC]">All Usages (Backbar & Retail)</option>
              <option value="Salon Professional" className="bg-[#151515] text-[#F8FAFC]">Salon Backbar (Professional)</option>
              <option value="Retail Sale" className="bg-[#151515] text-[#F8FAFC]">Retail Shelves</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 text-xs bg-[#151515] border border-[#27272A] rounded-xl font-bold text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
            >
              <option value="All" className="bg-[#151515] text-[#F8FAFC]">All Categories</option>
              <option value="Hair Care" className="bg-[#151515] text-[#F8FAFC]">Hair Care</option>
              <option value="Color & Chemical" className="bg-[#151515] text-[#F8FAFC]">Color & Chemical</option>
              <option value="Skin & Facial" className="bg-[#151515] text-[#F8FAFC]">Skin & Facial</option>
              <option value="Tools & Disposables" className="bg-[#151515] text-[#F8FAFC]">Tools & Disposables</option>
            </select>

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyLowStock
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm"
                  : "bg-[#151515] text-[#A1A1AA] border-[#27272A] hover:text-[#F8FAFC]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Alert ({lowStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-[#101010] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151515] text-[#71717A] font-mono text-[11px] uppercase tracking-wider border-b border-[#27272A]">
              <tr>
                <th className="py-3.5 px-4">Item & Brand</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Reorder Min</th>
                <th className="py-3.5 px-4">Cost Basis</th>
                <th className="py-3.5 px-4">Retail MSRP</th>
                <th className="py-3.5 px-4">Last Stocking</th>
                <th className="py-3.5 px-4 text-center">Fast Inventory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#27272A] text-[#71717A] flex items-center justify-center mx-auto">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif font-bold text-[#F8FAFC] text-sm">No inventory items match</h4>
                      <p className="text-xs text-[#71717A]">
                        Try modifying your search query or reset the filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setCategoryFilter("All");
                          setUsageFilter("All");
                          setOnlyLowStock(false);
                        }}
                        className="px-3.5 py-1.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.currentStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-[#181818] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F8FAFC] text-xs sm:text-sm">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#FACC15] font-bold">{item.brand}</span>
                          <span className="text-[11px] text-[#71717A] font-mono">SKU: {item.sku}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            item.usageType === "Retail Sale"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-[#181818] text-[#FACC15] border border-[#27272A]"
                          }`}
                        >
                          {item.usageType}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-mono font-bold ${
                              isLow ? "text-rose-400" : "text-[#F8FAFC]"
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> REORDER
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#A1A1AA] font-mono text-xs">
                        Min: {item.minThreshold} {item.unit}
                      </td>

                      <td className="py-4 px-4 font-bold text-[#F8FAFC] font-mono text-xs">{formatCurrency(item.costPrice)}</td>

                      <td className="py-4 px-4 font-bold text-[#FACC15] font-mono text-xs">
                        {item.retailPrice ? formatCurrency(item.retailPrice) : "—"}
                      </td>

                      <td className="py-4 px-4 text-[#71717A] font-mono text-xs">{item.lastRestocked}</td>

                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Deduct usage in salon floor */}
                          <button
                            onClick={() => updateStock(item.id, -1, "Floor consumption")}
                            title="Log 1 Unit Consumed in Treatment"
                            className="p-1.5 text-[#71717A] hover:text-rose-400 hover:bg-[#27272A] rounded-lg transition-colors border border-[#27272A] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Restock Action */}
                          <button
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQuantity(10);
                            }}
                            className="px-3 py-1.5 text-xs font-bold bg-[#181818] text-[#FACC15] hover:bg-[#27272A] border border-[#27272A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Restock Batch
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-sm">Replenish Product Batch</h3>
              <button onClick={() => setRestockModalItem(null)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#71717A] font-mono uppercase tracking-wider">Item:</span>
                <p className="font-bold text-[#F8FAFC] text-sm">{restockModalItem.name}</p>
                <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">
                  Current Floor Stock: <b className="text-[#FACC15]">{restockModalItem.currentStock} {restockModalItem.unit}</b>
                </p>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Add Units ({restockModalItem.unit})</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#27272A] rounded-xl text-base font-bold text-[#FACC15] focus:outline-none focus:border-[#FACC15] font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">Register New Beauty SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kérastase Chronologiste Hair Mask (200ml)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Kérastase"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-medium"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e: any) => setNewItemCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                  >
                    <option value="Hair Care" className="bg-[#151515] text-[#F8FAFC]">Hair Care</option>
                    <option value="Color & Chemical" className="bg-[#151515] text-[#F8FAFC]">Color & Chemical</option>
                    <option value="Skin & Facial" className="bg-[#151515] text-[#F8FAFC]">Skin & Facial</option>
                    <option value="Tools & Disposables" className="bg-[#151515] text-[#F8FAFC]">Tools & Disposables</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Usage Type</label>
                  <select
                    value={newItemUsage}
                    onChange={(e: any) => setNewItemUsage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                  >
                    <option value="Salon Professional" className="bg-[#151515] text-[#F8FAFC]">Salon Backbar (Pro)</option>
                    <option value="Retail Sale" className="bg-[#151515] text-[#F8FAFC]">Retail Sale Shelf</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="Bottles / Tubs / Packs"
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newItemCurrentStock}
                    onChange={(e) => setNewItemCurrentStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Min Alert Threshold</label>
                  <input
                    type="number"
                    value={newItemMinThreshold}
                    onChange={(e) => setNewItemMinThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={newItemCostPrice}
                    onChange={(e) => setNewItemCostPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold font-mono"
                  />
                </div>
                {newItemUsage === "Retail Sale" && (
                  <div>
                    <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Retail Shelf Price (₹)</label>
                    <input
                      type="number"
                      value={newItemRetailPrice}
                      onChange={(e) => setNewItemRetailPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#FACC15] focus:outline-none focus:border-[#FACC15] font-bold font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#181818] text-[#A1A1AA] hover:text-[#F8FAFC] font-bold rounded-xl border border-[#27272A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold rounded-xl shadow-md shadow-[#FACC15]/10 cursor-pointer"
                >
                  Register SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
