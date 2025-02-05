"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categories } from "@/components/customization/categories";
import { DietaryOptions } from "@/components/customization/dietary-options";
import { CustomizationGroups } from "@/components/customization/customization-groups";

export default function CustomizationPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Menu Customization</h1>
      
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="dietary">Dietary Options</TabsTrigger>
          <TabsTrigger value="customization">Customization Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Categories />
        </TabsContent>

        <TabsContent value="dietary">
          <DietaryOptions />
        </TabsContent>

        <TabsContent value="customization">
          <CustomizationGroups />
        </TabsContent>
      </Tabs>
    </div>
  );
} 