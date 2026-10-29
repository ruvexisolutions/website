"use client";

import React, { useState } from "react";
import { useBillCare } from "@/lib/billcare-context";
import { formatCurrency } from "@/lib/utils";
import { ServiceItem } from "@/lib/types";
import {
  Scissors,
  Plus,
  Search,
  Sparkles,
  Clock,
  Tag,
  Star,
  CheckCircle2,
  X,
  Edit2,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";

export function ServicesView() {
  const { services, inventory, addService, updateService } = useBillCare();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  // New service form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<
    "Hair" | "Skin & Spa" | "Nails" | "Beard & Grooming" | "Makeup"
  >("Hair");
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newPrice, setNewPrice] = useState<number>(2500);
  const [newDescription, setNewDescription] = useState("");
  const [newMaterialUsed, setNewMaterialUsed] = useState("");
  const [newMaterialItemId, setNewMaterialItemId] = useState("");
  const [newMaterialQuantity, setNewMaterialQuantity] = useState<number>(0);
  const [newMaterialUnit, setNewMaterialUnit] = useState("ml");
  const [newPopular, setNewPopular] = useState(false);

  const categories = ["All", "Hair", "Skin & Spa", "Nails", "Beard & Grooming", "Makeup"];

  const filteredServices = services.filter((s) => {
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const avgPrice = Math.round(
    services.reduce((acc, s) => acc + s.price, 0) / (services.length || 1)
  );
  const popularCount = services.filter((s) => s.popular).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addService({
      name: newName,
      category: newCategory,
      durationMinutes: newDuration,
      price: newPrice,
      description: newDescription,
      materialUsed: newMaterialUsed,
      materialItemId: newMaterialItemId || undefined,
      materialQuantity: newMaterialQuantity || 0,
      materialUnit: newMaterialUnit,
      averageMaterialUsed: newMaterialUsed,
      popular: newPopular,
    });

    setShowAddModal(false);
    setNewName("");
    setNewDescription("");
    setNewMaterialUsed("");
    setNewMaterialItemId("");
    setNewMaterialQuantity(0);
    setNewMaterialUnit("ml");
  };

  const handleSavePriceEdit = (id: string) => {
    if (editingPrice > 0) {
      updateService(id, { price: editingPrice });
    }
    setEditingServiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#101010] border border-[#27272A] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shadow-lg shadow-[#FACC15]/5 shrink-0">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#F8FAFC] tracking-tight">
                Services & Menu Catalog
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A]">
                {services.length} Services Available
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Service times • Prices with GST • Ready for front desk & online bookings
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#FACC15]/10 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Total Services
          </span>
          <span className="text-lg font-mono font-bold text-[#F8FAFC] mt-1 block">
            {services.length} Items
          </span>
        </div>
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Average Price
          </span>
          <span className="text-lg font-mono font-bold text-[#FACC15] mt-1 block">
            {formatCurrency(avgPrice)}
          </span>
        </div>
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            Most Popular
          </span>
          <span className="text-lg font-mono font-bold text-[#FACC15] mt-1 block">
            {popularCount} Favorites
          </span>
        </div>
        <div className="bg-[#151515] border border-[#27272A] p-4 rounded-xl">
          <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-wider block">
            GST Included
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
            5% Standard
          </span>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search services by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#FACC15] font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-[#FACC15] text-[#080808] border-[#FACC15] shadow-sm"
                  : "bg-[#151515] text-[#A1A1AA] border-[#27272A] hover:text-[#F8FAFC]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-[#151515] border border-[#27272A] p-12 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#27272A] text-[#FACC15] flex items-center justify-center mx-auto">
            <Scissors className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F8FAFC]">No Services Found</h3>
            <p className="text-xs text-[#71717A] mt-1">
              Your service catalog is completely clean. Click below to add your first service from scratch.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#080808] font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Your First Service
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-[#151515] border border-[#27272A] rounded-xl p-5 flex flex-col justify-between hover:border-[#FACC15]/50 hover:bg-[#181818] transition-all shadow-lg"
          >
            <div>
              {/* Category Pill & Popular Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A] tracking-wider">
                  {service.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {service.popular && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#181818] text-[#FACC15] border border-[#27272A] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#FACC15] text-[#FACC15]" /> Bestseller
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#71717A] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#71717A]" /> {service.durationMinutes}m
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3.5">
                <h3 className="font-serif font-bold text-[#F8FAFC] text-base leading-snug">
                  {service.name}
                </h3>
                <p className="text-xs text-[#71717A] mt-1 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {(service.materialUsed || service.averageMaterialUsed) && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-[#111111] border border-[#27272A] flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
                    <Package className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
                    <span className="truncate">
                      <span className="text-[#71717A]">Material:</span>{" "}
                      <span className="text-[#F8FAFC] font-medium font-mono">{service.materialUsed || service.averageMaterialUsed}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Edit Section */}
            <div className="mt-5 pt-3 border-t border-[#27272A] flex items-center justify-between">
              {editingServiceId === service.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-xs bg-[#181818] border border-[#FACC15] text-[#F8FAFC] rounded-lg font-mono font-bold"
                  />
                  <button
                    onClick={() => handleSavePriceEdit(service.id)}
                    className="px-2.5 py-1 bg-[#FACC15] text-[#080808] rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingServiceId(null)}
                    className="p-1 text-[#71717A] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-[#FACC15] text-lg">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-[10px] text-[#71717A] font-mono">+5% GST</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingServiceId(service.id);
                    setEditingPrice(service.price);
                  }}
                  className="p-1.5 text-[#71717A] hover:text-[#FACC15] hover:bg-[#181818] rounded-lg transition-colors cursor-pointer"
                  title="Edit Price"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateService(service.id, { popular: !service.popular })}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    service.popular
                      ? "text-[#FACC15] hover:bg-[#181818]"
                      : "text-[#71717A] hover:text-[#FACC15]"
                  }`}
                  title="Toggle Popular Status"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Treatment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101010] border border-[#27272A] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <h3 className="font-serif font-bold text-[#F8FAFC] text-base">
                Add New Salon Treatment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#F8FAFC] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Treatment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japanese Silk Keratin Infusion"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-bold"
                  >
                    <option value="Hair" className="bg-[#151515] text-[#F8FAFC]">Hair</option>
                    <option value="Skin & Spa" className="bg-[#151515] text-[#F8FAFC]">Skin & Spa</option>
                    <option value="Nails" className="bg-[#151515] text-[#F8FAFC]">Nails</option>
                    <option value="Beard & Grooming" className="bg-[#151515] text-[#F8FAFC]">Beard & Grooming</option>
                    <option value="Makeup" className="bg-[#151515] text-[#F8FAFC]">Makeup</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-[#A1A1AA] block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Bespoke service details, benefits and steps..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#151515] border border-[#27272A] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                />
              </div>

              {/* Consumable Material / Stock Monitoring */}
              <div className="p-3 bg-[#181818] border border-[#27272A] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] text-[#FACC15] font-bold flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>Average Material Used (Stock Monitor)</span>
                  </label>
                  <span className="text-[10px] text-[#71717A] font-mono">Inventory Link</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="e.g. Keratin Serum or Majirel 60ml"
                      value={newMaterialUsed}
                      onChange={(e) => setNewMaterialUsed(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121212] border border-[#27272A] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15]"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Qty"
                      value={newMaterialQuantity || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewMaterialQuantity(val);
                        if (!newMaterialUsed && val > 0) {
                          setNewMaterialUsed(`${val} ${newMaterialUnit}`);
                        }
                      }}
                      className="w-16 px-2 py-2 bg-[#121212] border border-[#27272A] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                    />
                    <select
                      value={newMaterialUnit}
                      onChange={(e) => setNewMaterialUnit(e.target.value)}
                      className="flex-1 px-1.5 py-2 bg-[#121212] border border-[#27272A] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FACC15] font-mono"
                    >
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="units">units</option>
                      <option value="bottles">btl</option>
                      <option value="ampoules">amp</option>
                    </select>
                  </div>
                </div>

                {inventory && inventory.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-[#71717A] block mb-1">Or link to salon stock item:</span>
                    <select
                      value={newMaterialItemId}
                      onChange={(e) => {
                        const itemId = e.target.value;
                        setNewMaterialItemId(itemId);
                        const matched = inventory.find((i) => i.id === itemId);
                        if (matched) {
                          setNewMaterialUsed(`${matched.name} (${newMaterialQuantity || 1} ${matched.unit || newMaterialUnit})`);
                          if (matched.unit) setNewMaterialUnit(matched.unit);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#27272A] rounded-lg text-[11px] text-[#A1A1AA] focus:outline-none focus:border-[#FACC15]"
                    >
                      <option value="">-- Select from Inventory Catalog (Optional) --</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.brand}) • {item.currentStock} {item.unit} in stock
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="text-[10px] text-[#71717A] leading-relaxed">
                  BillCare monitors this quantity to forecast backbar product depletion whenever this service is completed.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#F8FAFC]">
                <input
                  type="checkbox"
                  checked={newPopular}
                  onChange={(e) => setNewPopular(e.target.checked)}
                  className="rounded text-[#FACC15] focus:ring-[#FACC15]"
                />
                <span>Feature as Signature Bestseller</span>
              </label>

              <div className="pt-2 flex gap-2">
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
                  Add Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
