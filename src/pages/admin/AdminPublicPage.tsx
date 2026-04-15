
import { useState, useEffect } from "react";
import {
    Save,
    RefreshCw,
    Loader2,
    Image as ImageIcon,
    Palette,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, isAdminUser } from "@/contexts";
import AdminLayout from "@/components/admin/AdminLayout";
import { api, Settings } from "@/lib/api";
import { CloudinaryImageUpload } from "@/components/shared/CloudinaryImageUpload";

export default function AdminPublicPage() {
    const { toast } = useToast();
    const { t: tFn, language } = useLanguage();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("banners");

    const bannerKeys = [
        { key: "home", label: "Home Page", defaultPath: "/images/banners/banner-01.png" },
        { key: "products", label: "Shop All Products", defaultPath: "/images/banners/banner-01.png" },
        { key: "categories", label: "Categories Page", defaultPath: "/images/banners/banner-04.png" },
        { key: "search", label: "Search Results", defaultPath: "/images/banners/banner-04.png" },
        { key: "sale", label: "Sale Page", defaultPath: "/images/banners/banner-04.png" },
        { key: "about", label: "About Page", defaultPath: "/images/banners/banner-04.png" },
        { key: "contact", label: "Contact Page", defaultPath: "/images/banners/banner-09.png" },
        { key: "faq", label: "FAQ Page", defaultPath: "/images/banners/banner-05.png" },
        { key: "terms", label: "Terms of Service", defaultPath: "/images/banners/banner-06.png" },
        { key: "privacy", label: "Privacy Policy", defaultPath: "/images/banners/banner-10.png" },
        { key: "shipping", label: "Shipping Info", defaultPath: "/images/banners/banner-07.png" },
        { key: "returns", label: "Returns Policy", defaultPath: "/images/banners/banner-08.png" },
        { key: "sizeGuide", label: "Size Guide", defaultPath: "/images/banners/banner-11.png" },
        { key: "reviews", label: "Reviews Page", defaultPath: "/images/banners/banner-12.png" },
        { key: "wishlist", label: "Wishlist Page", defaultPath: "/images/banners/banner-13.png" },
        { key: "compare", label: "Compare Page", defaultPath: "/images/banners/banner-02.png" },
        { key: "tracking", label: "Order Tracking", defaultPath: "/images/banners/banner-03.png" },
        { key: "cart", label: "Cart Page", defaultPath: "/images/banners/banner-14.png" },
        { key: "checkout", label: "Checkout Page", defaultPath: "/images/banners/banner-15.png" },
        { key: "profile", label: "Profile Page", defaultPath: "/images/banners/banner-16.png" },
        { key: "login", label: "Login Page", defaultPath: "/images/banners/banner-17.png" },
        { key: "register", label: "Register Page", defaultPath: "/images/banners/banner-18.png" },
        { key: "forgotPassword", label: "Forgot Password Page", defaultPath: "/images/banners/banner-19.png" },
        { key: "resetPassword", label: "Reset Password Page", defaultPath: "/images/banners/banner-20.png" },
        { key: "notFound", label: "404 Not Found Page", defaultPath: "/images/banners/banner-21.png" },
    ];

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !isAdminUser(user)) {
                navigate("/admin/login");
            } else {
                loadSettings();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated, user, navigate]);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await api.getSettings();
            // Ensure banners object exists
            if (!data.banners) {
                data.banners = {};
            }
            setSettings(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading settings:', error);
            toast({
                title: "Error",
                description: "Could not load settings",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings) return;

        try {
            setIsSaving(true);
            await api.updateSettings(settings);

            toast({
                title: "Success",
                description: "Public settings saved successfully",
            });

            // Trigger update event for other components if needed
            window.dispatchEvent(new CustomEvent('settingsUpdated'));
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Error",
                description: "Could not save settings",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBannerChange = (key: string, url: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            banners: {
                ...settings.banners,
                [key]: url
            }
        });
    };

    const handleLogoUpload = (images: any[]) => {
        if (images.length > 0 && settings) {
            setSettings({
                ...settings,
                logoUrl: images[0].secureUrl
            });
        }
    };

    const handleFaviconUpload = (images: any[]) => {
        if (images.length > 0 && settings) {
            setSettings({
                ...settings,
                faviconUrl: images[0].secureUrl
            });
        }
    };

    if (authLoading || isLoading || !settings) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Public Page Management</h1>
                        <p className="text-muted-foreground">Manage banners, logos, and website appearance.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={loadSettings}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={handleSaveSettings} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="banners" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Banners
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="banners" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bannerKeys.map((banner) => (
                                <Card key={banner.key}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{banner.label}</CardTitle>
                                        <CardDescription>Banner for {banner.key} page</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="aspect-video relative rounded-md overflow-hidden bg-muted border">
                                            <img
                                                src={settings.banners?.[banner.key] || banner.defaultPath}
                                                alt={`${banner.label} Banner`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image URL</Label>
                                            <Input
                                                value={settings.banners?.[banner.key] || banner.defaultPath}
                                                onChange={(e) => handleBannerChange(banner.key, e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Upload New</Label>
                                            <CloudinaryImageUpload
                                                onImagesUploaded={(imgs) => {
                                                    if (imgs.length > 0) handleBannerChange(banner.key, imgs[0].secureUrl);
                                                }}
                                                onImagesRemoved={() => { }}
                                                maxFiles={1}
                                                className="w-full"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Logo</CardTitle>
                                    <CardDescription>Website logo (Dark & Light mode versions)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-muted rounded-md flex justify-center">
                                        <img
                                            src={settings.logoUrl}
                                            alt="Logo Preview"
                                            className="h-16 object-contain"
                                        />
                                    </div>
                                    <Input
                                        value={settings.logoUrl}
                                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                        placeholder="Logo URL"
                                    />
                                    <CloudinaryImageUpload
                                        onImagesUploaded={handleLogoUpload}
                                        onImagesRemoved={() => { }}
                                        maxFiles={1}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Favicon</CardTitle>
                                    <CardDescription>Browser tab icon</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-muted rounded-md flex justify-center">
                                        <img
                                            src={settings.faviconUrl}
                                            alt="Favicon Preview"
                                            className="h-8 w-8 object-contain"
                                        />
                                    </div>
                                    <Input
                                        value={settings.faviconUrl}
                                        onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                                        placeholder="Favicon URL"
                                    />
                                    <CloudinaryImageUpload
                                        onImagesUploaded={handleFaviconUpload}
                                        onImagesRemoved={() => { }}
                                        maxFiles={1}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Color Scheme</CardTitle>
                                <CardDescription>Primary brand color</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-10 w-10 rounded-full border shadow-sm"
                                        style={{ backgroundColor: settings.primaryColor }}
                                    />
                                    <Input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="w-24 h-10 p-1"
                                    />
                                    <Input
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="w-32"
                                        placeholder="#000000"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
