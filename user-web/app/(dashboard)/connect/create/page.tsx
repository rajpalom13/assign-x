"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Home,
  Briefcase,
  MessageSquare,
  Camera,
  X,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Building2,
  Clock,
  Upload,
  AlertCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ListingType, ProductCondition } from "@/types/marketplace";
import {
  uploadMarketplaceImage,
  createMarketplaceListing,
} from "@/lib/actions/marketplace";

/**
 * Image upload state interface
 */
interface UploadedImage {
  id: string;
  url: string;
  previewUrl: string;
  status: "uploading" | "complete" | "error";
  progress: number;
  error?: string;
}

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image types
 */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Listing type configuration
 */
const listingTypes = [
  {
    id: "product" as ListingType,
    label: "Product",
    description: "Books, gadgets, supplies",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    id: "housing" as ListingType,
    label: "Housing",
    description: "Rooms, flatmates",
    icon: Home,
    color: "bg-green-500",
  },
  {
    id: "opportunity" as ListingType,
    label: "Opportunity",
    description: "Jobs, internships, events",
    icon: Briefcase,
    color: "bg-purple-500",
  },
  {
    id: "community" as ListingType,
    label: "Community",
    description: "Questions, reviews, polls",
    icon: MessageSquare,
    color: "bg-orange-500",
  },
];

/**
 * Product categories
 */
const productCategories = [
  "Books & Notes",
  "Electronics",
  "Drafting Tools",
  "Lab Equipment",
  "Furniture",
  "Clothing",
  "Cycles",
  "Other",
];

/**
 * Opportunity types
 */
const opportunityTypes = [
  { value: "internship", label: "Internship" },
  { value: "job", label: "Job" },
  { value: "event", label: "Event" },
  { value: "gig", label: "Gig/Freelance" },
  { value: "workshop", label: "Workshop" },
];

/**
 * Community post types
 */
const communityTypes = [
  { value: "question", label: "Question" },
  { value: "review", label: "Review" },
  { value: "poll", label: "Poll" },
  { value: "discussion", label: "Discussion" },
];

/**
 * Room types for housing
 */
const roomTypes = [
  { value: "single", label: "Single Room" },
  { value: "shared", label: "Shared Room" },
  { value: "flat", label: "Entire Flat" },
];

/**
 * Create Listing Page
 * Create new marketplace listings
 * Implements U75 from feature spec
 */
export default function CreateListingPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ListingType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Common fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Product fields
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<ProductCondition>("good");
  const [category, setCategory] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Housing fields
  const [monthlyRent, setMonthlyRent] = useState("");
  const [roomType, setRoomType] = useState("single");
  const [location, setLocation] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");

  // Opportunity fields
  const [opportunityType, setOpportunityType] = useState("internship");
  const [company, setCompany] = useState("");
  const [oppLocation, setOppLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [stipend, setStipend] = useState("");
  const [duration, setDuration] = useState("");

  // Community fields
  const [postType, setPostType] = useState("question");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported: ${file.name}. Allowed: JPEG, PNG, WebP, GIF`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${file.name} (max 5MB)`;
    }
    return null;
  }, []);

  /**
   * Upload a single file to Supabase Storage
   */
  const uploadFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create local preview URL
    const previewUrl = URL.createObjectURL(file);

    // Add to state as uploading
    const uploadingImage: UploadedImage = {
      id,
      url: "",
      previewUrl,
      status: "uploading",
      progress: 0,
    };

    setImages((prev) => [...prev, uploadingImage]);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id && img.status === "uploading"
            ? { ...img, progress: Math.min(img.progress + 20, 80) }
            : img
        )
      );
    }, 200);

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to Supabase Storage via server action
      const result = await uploadMarketplaceImage({
        name: file.name,
        type: file.type,
        size: file.size,
        base64Data,
      });

      clearInterval(progressInterval);

      if (result.error) {
        // Update state with error
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? { ...img, status: "error", error: result.error || "Upload failed", progress: 0 }
              : img
          )
        );
        toast.error(result.error);
        return null;
      }

      // Update state with success
      const completedImage: UploadedImage = {
        id,
        url: result.data!.url,
        previewUrl,
        status: "complete",
        progress: 100,
      };

      setImages((prev) =>
        prev.map((img) => (img.id === id ? completedImage : img))
      );

      return completedImage;
    } catch (error) {
      clearInterval(progressInterval);

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, status: "error", error: "Upload failed", progress: 0 }
            : img
        )
      );

      toast.error("Failed to upload image");
      return null;
    }
  }, []);

  /**
   * Process files for upload
   */
  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      setUploadError(null);

      const currentImageCount = images.filter(
        (img) => img.status !== "error"
      ).length;

      if (currentImageCount + files.length > 5) {
        setUploadError("Maximum 5 images allowed");
        toast.error("Maximum 5 images allowed");
        return;
      }

      // Validate all files first
      for (const file of Array.from(files)) {
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError(validationError);
          toast.error(validationError);
          return;
        }
      }

      // Upload files
      for (const file of Array.from(files)) {
        await uploadFile(file);
      }
    },
    [images, validateFile, uploadFile]
  );

  /**
   * Handle file input change
   */
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = ""; // Reset input
    },
    [processFiles]
  );

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  /**
   * Remove image
   */
  const removeImage = useCallback((imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove?.previewUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((img) => img.id !== imageId);
    });
    setUploadError(null);
  }, []);

  /**
   * Add amenity
   */
  const addAmenity = () => {
    if (amenityInput && !amenities.includes(amenityInput)) {
      setAmenities([...amenities, amenityInput]);
      setAmenityInput("");
    }
  };

  /**
   * Add tag
   */
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  /**
   * Update poll option
   */
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  /**
   * Add poll option
   */
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return false;
    }

    if (selectedType === "product") {
      if (!price || parseFloat(price) <= 0) {
        toast.error("Please enter a valid price");
        return false;
      }
      if (!category) {
        toast.error("Please select a category");
        return false;
      }
    }

    if (selectedType === "housing") {
      if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
        toast.error("Please enter a valid rent amount");
        return false;
      }
      if (!location.trim()) {
        toast.error("Please enter location");
        return false;
      }
    }

    if (selectedType === "community" && postType === "poll") {
      const validOptions = pollOptions.filter((o) => o.trim());
      if (validOptions.length < 2) {
        toast.error("Please add at least 2 poll options");
        return false;
      }
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm() || !selectedType) return;

    // Check if there are pending uploads
    const pendingUploads = images.filter((img) => img.status === "uploading");
    if (pendingUploads.length > 0) {
      toast.error("Please wait for all images to finish uploading");
      return;
    }

    // Get successfully uploaded image URLs
    const imageUrls = images
      .filter((img) => img.status === "complete" && img.url)
      .map((img) => img.url);

    setIsSubmitting(true);
    try {
      // Build metadata based on type
      let metadata: Record<string, any> = {};
      let priceValue = 0;
      let locationValue: string | undefined;

      switch (selectedType) {
        case "product":
          priceValue = parseFloat(price) || 0;
          metadata = {
            condition,
            category,
            is_negotiable: isNegotiable,
          };
          break;
        case "housing":
          priceValue = parseFloat(monthlyRent) || 0;
          locationValue = location;
          metadata = {
            room_type: roomType,
            available_from: availableFrom || undefined,
            amenities,
            is_available: true,
          };
          break;
        case "opportunity":
          locationValue = oppLocation;
          metadata = {
            opportunity_type: opportunityType,
            company: company || undefined,
            is_remote: isRemote,
            deadline: deadline || undefined,
            stipend: stipend ? parseFloat(stipend) : undefined,
            duration: duration || undefined,
          };
          break;
        case "community":
          metadata = {
            post_type: postType,
            tags,
            poll_options:
              postType === "poll"
                ? pollOptions
                    .filter((o) => o.trim())
                    .map((text, i) => ({ id: `opt-${i}`, text, votes: 0 }))
                : undefined,
          };
          break;
      }

      // Create listing via server action
      const result = await createMarketplaceListing({
        type: selectedType,
        title,
        description: description || undefined,
        price: priceValue,
        location: locationValue,
        imageUrls,
        metadata,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Listing created successfully!");
      router.push("/connect");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Create Listing</h1>
            <p className="text-sm text-muted-foreground">
              Share with your campus community
            </p>
          </div>
        </div>

        {/* Type Selection */}
        {!selectedType ? (
          <div className="grid grid-cols-2 gap-4">
            {listingTypes.map((type) => (
              <Card
                key={type.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                      type.color
                    )}
                  >
                    <type.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected Type Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-2 py-1.5">
                {listingTypes.find((t) => t.id === selectedType)?.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                Change Type
              </Button>
            </div>

            {/* Image Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadError && (
                  <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                )}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex gap-3 flex-wrap mb-4">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={img.previewUrl}
                          alt={`Upload ${img.id}`}
                          className="w-full h-full object-cover"
                        />
                        {img.status === "uploading" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Progress value={img.progress} className="w-10" />
                          </div>
                        )}
                        {img.status === "error" && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                        {img.status !== "uploading" && (
                          <button
                            className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                            onClick={() => removeImage(img.id)}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {images.filter((img) => img.status !== "error").length < 5 && (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Drop images or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP, GIF • Max 5MB per image
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 photos
                </p>
              </CardContent>
            </Card>

            {/* Common Fields */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="What are you listing?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add more details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Fields */}
            {selectedType === "product" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="₹0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition *</Label>
                      <Select value={condition} onValueChange={(value) => setCondition(value as ProductCondition)}>
                        <SelectTrigger id="condition">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="negotiable">Price Negotiable?</Label>
                    <Switch
                      id="negotiable"
                      checked={isNegotiable}
                      onCheckedChange={setIsNegotiable}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Housing Fields */}
            {selectedType === "housing" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Housing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent">Monthly Rent *</Label>
<Input
                        id="rent"
                        type="number"
                        placeholder="₹0"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-type">Room Type *</Label>
                      <Select value={roomType} onValueChange={setRoomType}>
                        <SelectTrigger id="room-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available">Available From</Label>
                    <Input
                      id="available"
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amenity-input">Amenities</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amenity-input"
                        placeholder="e.g., WiFi, AC"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addAmenity();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addAmenity}
                        className="px-3"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="gap-1 cursor-pointer"
                          onClick={() =>
                            setAmenities(amenities.filter((a) => a !== amenity))
                          }
                        >
                          {amenity}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunity Fields */}
            {selectedType === "opportunity" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Opportunity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="opp-type">Opportunity Type</Label>
                    <Select value={opportunityType} onValueChange={setOpportunityType}>
                      <SelectTrigger id="opp-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {opportunityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stipend">Stipend/Salary</Label>
                      <Input
                        id="stipend"
                        type="number"
                        placeholder="₹0"
                        value={stipend}
                        onChange={(e) => setStipend(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="opp-location">Location</Label>
                      <Input
                        id="opp-location"
                        placeholder="Job location"
                        value={oppLocation}
                        onChange={(e) => setOppLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 2 months"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="remote">Remote?</Label>
                    <Switch
                      id="remote"
                      checked={isRemote}
                      onCheckedChange={setIsRemote}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Fields */}
            {selectedType === "community" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Community Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-type">Post Type</Label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger id="post-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {communityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {postType === "poll" && (
                    <div className="space-y-3">
                      <Label>Poll Options</Label>
                      {pollOptions.map((option, index) => (
                        <Input
                          key={index}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                        />
                      ))}
                      {pollOptions.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                        >
                          Add Option
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tag-input">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tag-input"
                        placeholder="Add tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addTag}
                        className="px-3"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 cursor-pointer"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                        >
                          #{tag}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}