"use client";

import * as React from "react";
import Image from "next/image";
import { Edit, Loader, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import axios from "@/utils/axios/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { currencyFormatBDT } from "@/lib/all_utils";
import {
  createProductGroup,
  deleteProductGroup,
  updateProductGroup,
} from "@/actions/admin/product-groups";

type GroupProduct = {
  _id: string;
  name: string;
  slug: string;
  mainImage?: string;
  price: number;
  published?: boolean;
};

type ProductGroup = {
  _id: string;
  name: string;
  title?: string;
  isActive: boolean;
  // product is null when the product was deleted
  members: { product: GroupProduct | null; label?: string }[];
};

type DraftMember = { product: GroupProduct; label: string };

type Draft = {
  id: string | null; // null = creating
  name: string;
  title: string;
  isActive: boolean;
  members: DraftMember[];
};

const emptyDraft: Draft = {
  id: null,
  name: "",
  title: "",
  isActive: true,
  members: [],
};

const ProductThumb = ({ product }: { product: GroupProduct }) => (
  <div className="relative shrink-0 w-10 h-10 rounded border border-stone-200 bg-white overflow-hidden">
    <Image
      src={product.mainImage || "/assets/placeholder-product.svg"}
      alt={product.name}
      fill
      sizes="40px"
      className="object-contain p-0.5"
    />
  </div>
);

// Debounced product search, used to add members to a group
const ProductSearch = ({
  excludeIds,
  onPick,
}: {
  excludeIds: string[];
  onPick: (product: GroupProduct) => void;
}) => {
  const [term, setTerm] = React.useState("");
  const [results, setResults] = React.useState<GroupProduct[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const search = term.trim();
    if (search.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/products`, {
          params: { search, limit: 8 },
        });
        if (!cancelled) setResults(res.data?.data || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const visible = results.filter((p) => !excludeIds.includes(p._id));

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products by name or SKU to add..."
          className="pl-8"
        />
        {loading && (
          <Loader className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-stone-400" />
        )}
      </div>
      {visible.length > 0 && (
        <div className="flex flex-col border border-stone-200 rounded-md divide-y divide-stone-100 max-h-72 overflow-y-auto bg-white">
          {visible.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                onPick(p);
                setTerm("");
              }}
              className="flex items-center gap-3 px-3 py-2 text-left hover:bg-stone-50"
            >
              <ProductThumb product={p} />
              <span className="flex-1 text-sm text-stone-800 line-clamp-1">
                {p.name}
              </span>
              <span className="text-xs text-stone-500 whitespace-nowrap">
                BDT {currencyFormatBDT(p.price)}
              </span>
              <Plus className="w-4 h-4 text-stone-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GroupForm = ({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Draft;
  onCancel: () => void;
  onSaved: () => void;
}) => {
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [isSaving, startSaving] = React.useTransition();

  const updateMember = (index: number, label: string) =>
    setDraft((d) => ({
      ...d,
      members: d.members.map((m, i) => (i === index ? { ...m, label } : m)),
    }));

  const removeMember = (index: number) =>
    setDraft((d) => ({
      ...d,
      members: d.members.filter((_, i) => i !== index),
    }));

  const handleSave = () => {
    if (!draft.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (draft.members.length < 2) {
      toast.error("Add at least 2 products to the group");
      return;
    }

    const payload = {
      name: draft.name.trim(),
      title: draft.title.trim() || undefined,
      isActive: draft.isActive,
      members: draft.members.map((m) => ({
        product: m.product._id,
        label: m.label.trim() || undefined,
      })),
    };

    startSaving(async () => {
      const result = draft.id
        ? await updateProductGroup(draft.id, payload)
        : await createProductGroup(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(draft.id ? "Product group updated" : "Product group created");
      onSaved();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {draft.id ? "Edit Product Group" : "New Product Group"}
        </CardTitle>
        <CardDescription>
          Products in a group show each other on their details page, sorted by
          price, with the price difference.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
            Group name (admin only)
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Bambu Lab A1 Series"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
            Heading on product page
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Available Models"
              maxLength={60}
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={draft.isActive}
            onCheckedChange={(isActive) => setDraft({ ...draft, isActive })}
          />
          <span className="text-sm text-stone-700">
            {draft.isActive ? "Shown on storefront" : "Hidden from storefront"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-800">
            Products ({draft.members.length})
          </span>
          {draft.members.length > 0 && (
            <div className="flex flex-col border border-stone-200 rounded-md divide-y divide-stone-100">
              {draft.members.map((m, index) => (
                <div
                  key={m.product._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 py-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ProductThumb product={m.product} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-stone-800 line-clamp-1">
                        {m.product.name}
                      </span>
                      <span className="text-xs text-stone-500">
                        BDT {currencyFormatBDT(m.product.price)}
                        {m.product.published === false && " · Unpublished (hidden)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={m.label}
                      onChange={(e) => updateMember(index, e.target.value)}
                      placeholder="Short label (optional)"
                      maxLength={40}
                      className="h-8 sm:w-48 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(index)}
                      className="h-8 w-8 p-0 text-stone-500 hover:text-red-600"
                      aria-label={`Remove ${m.product.name}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <ProductSearch
            excludeIds={draft.members.map((m) => m.product._id)}
            onPick={(product) =>
              setDraft((d) => ({
                ...d,
                members: [...d.members, { product, label: "" }],
              }))
            }
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {draft.id ? "Save Changes" : "Create Group"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const GroupRow = ({
  group,
  onEdit,
  refetch,
}: {
  group: ProductGroup;
  onEdit: () => void;
  refetch: () => Promise<void>;
}) => {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const [isTogglePending, startToggleTransition] = React.useTransition();
  const products = group.members
    .map((m) => m.product)
    .filter((p): p is GroupProduct => !!p);

  const handleToggle = (isActive: boolean) => {
    startToggleTransition(async () => {
      const result = await updateProductGroup(group._id, { isActive });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      await refetch();
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteProductGroup(group._id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Product group deleted");
      setIsDeleteOpen(false);
      await refetch();
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 bg-white">
      <div className="flex flex-col flex-1 min-w-0 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-900">{group.name}</span>
          <span className="text-xs text-stone-500">
            {`· ${group.title || "Available Models"} · ${products.length} products`}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {products.map((p) => (
            <div key={p._id} title={`${p.name} · BDT ${currencyFormatBDT(p.price)}`}>
              <ProductThumb product={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={group.isActive}
          onCheckedChange={handleToggle}
          disabled={isTogglePending}
          aria-label="Show on storefront"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
          aria-label="Edit product group"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <DeleteDialog<ProductGroup>
          rowitem={group}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onDelete={handleDelete}
          isDeletePending={isDeletePending}
          entityName="product group"
          warningDescription="The products stay as they are; they just stop showing each other."
        />
      </div>
    </div>
  );
};

export const ProductGroupsManager = () => {
  const [groups, setGroups] = React.useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);

  const refetch = React.useCallback(async () => {
    try {
      const res = await axios.get(`/product-groups`);
      setGroups(res.data?.data || []);
      setError(null);
    } catch {
      setError("Could not load product groups. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const startEdit = (group: ProductGroup) =>
    setDraft({
      id: group._id,
      name: group.name,
      title: group.title || "",
      isActive: group.isActive,
      // deleted products are dropped; saving removes them from the group
      members: group.members
        .filter((m): m is DraftMember => !!m.product)
        .map((m) => ({ product: m.product, label: m.label || "" })),
    });

  return (
    <div className="flex flex-col gap-6">
      {draft ? (
        <GroupForm
          key={draft.id || "new"}
          initial={draft}
          onCancel={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            refetch();
          }}
        />
      ) : (
        <div>
          <Button type="button" onClick={() => setDraft(emptyDraft)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Product Group
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-stone-500">Loading product groups...</p>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-stone-500">
          No product groups yet. Create one to show related models on product pages.
        </p>
      ) : (
        <div className="flex flex-col border border-stone-200 rounded-md divide-y divide-stone-200 overflow-hidden">
          {groups.map((group) => (
            <GroupRow
              key={group._id}
              group={group}
              onEdit={() => startEdit(group)}
              refetch={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
