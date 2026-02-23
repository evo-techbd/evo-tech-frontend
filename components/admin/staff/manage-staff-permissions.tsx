"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import { Permission } from "@/schemas/admin/permissionSchema";
import { Shield, Save, Loader2, Info } from "lucide-react";

interface ManageStaffPermissionsProps {
  staffUuid: string;
  staffName: string;
}

export function ManageStaffPermissions({
  staffUuid,
  staffName,
}: ManageStaffPermissionsProps) {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Fetch all available permissions
      const allPermsRes = await axios.get("/permissions");

      // Fetch staff's current permissions
      const staffPermsRes = await axios.get(`/permissions/staff/${staffUuid}`);

      if (allPermsRes.data.success) {
        setAllPermissions(allPermsRes.data.data);
      }

      if (staffPermsRes.data.success) {
        setSelectedPermissions(staffPermsRes.data.data.permissionCodes || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, staffUuid]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleTogglePermission = (permissionCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleSelectAll = (category: string) => {
    const categoryPerms = allPermissions
      .filter((p) => p.category === category)
      .map((p) => p.code);

    const allSelected = categoryPerms.every((code) =>
      selectedPermissions.includes(code)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPerms.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...categoryPerms]),
      ]);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setIsSaving(true);

      const response = await axios.put(`/permissions/staff/${staffUuid}`, {
        permissions: selectedPermissions,
      });

      if (response.data.success) {
        toast.success("Permissions updated successfully!");
        toast.info(
          "Staff member must log out and log back in for changes to take effect."
        );
      }
    } catch (error: any) {
      console.error("Error saving permissions:", error);
      toast.error(
        error.response?.data?.message || "Failed to update permissions"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      dashboard: "bg-blue-100 text-blue-700",
      products: "bg-green-100 text-green-700",
      orders: "bg-purple-100 text-purple-700",
      customers: "bg-orange-100 text-orange-700",
      reports: "bg-pink-100 text-pink-700",
      settings: "bg-gray-100 text-gray-700",
      staff: "bg-indigo-100 text-indigo-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  // Group permissions by category
  const categories = [...new Set(allPermissions.map((p) => p.category))];
  const permissionsByCategory = categories.reduce((acc, category) => {
    acc[category] = allPermissions.filter((p) => p.category === category);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Manage Permissions for {staffName}
            </CardTitle>
            <CardDescription>
              Select which dashboard sections this staff member can access
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto">
            {selectedPermissions.length} of {allPermissions.length} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> After saving permissions, the staff
            member must log out and log back in for changes to take effect.
          </AlertDescription>
        </Alert>

        {categories.map((category) => {
          const categoryPerms = permissionsByCategory[category] || [];
          const allCategorySelected = categoryPerms.every((p) =>
            selectedPermissions.includes(p.code)
          );
          const someCategorySelected = categoryPerms.some((p) =>
            selectedPermissions.includes(p.code)
          );

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(category)}>
                    {category.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    (
                    {
                      categoryPerms.filter((p) =>
                        selectedPermissions.includes(p.code)
                      ).length
                    }
                    /{categoryPerms.length})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(category)}
                >
                  {allCategorySelected ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-gray-200">
                {categoryPerms.map((permission) => (
                  <div
                    key={permission.code}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={permission.code}
                      checked={selectedPermissions.includes(permission.code)}
                      onCheckedChange={() =>
                        handleTogglePermission(permission.code)
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={permission.code}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {permission.name}
                      </label>
                      {permission.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={fetchPermissions}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
