"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ListingType, ProductCondition } from "@/types/marketplace";

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
  const [images, setImages] = useState<string[]>([]);

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
   * Handle image upload
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove image
   */
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Build payload based on type
      const basePayload = {
        type: selectedType,
        title,
        description,
        images,
      };

      let payload;
      switch (selectedType) {
        case "product":
          payload = {
            ...basePayload,
            price: parseFloat(price),
            condition,
            category,
            isNegotiable,
          };
          break;
        case "housing":
          payload = {
            ...basePayload,
            monthlyRent: parseFloat(monthlyRent),
            roomType,
            location,
            availableFrom,
            amenities,
          };
          break;
        case "opportunity":
          payload = {
            ...basePayload,
            opportunityType,
            company,
            location: oppLocation,
            isRemote,
            deadline,
            stipend: stipend ? parseFloat(stipend) : undefined,
            duration,
          };
          break;
        case "community":
          payload = {
            ...basePayload,
            postType,
            tags,
            pollOptions:
              postType === "poll"
                ? pollOptions
                    .filter((o) => o.trim())
                    .map((text, i) => ({ id: `opt-${i}`, text, votes: 0 }))
                : undefined,
          };
          break;
      }

      // In production: POST to /api/marketplace/listings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Creating listing:", payload);

      toast.success("Listing created successfully!");
      router.push("/connect");
    } catch {
      toast.error("Failed to create listing");
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
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50">
                      <Camera className="h-6 w-6 text-muted-foreground" />
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
                <p className="text-xs text-muted-foreground mt-2">
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
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing & Condition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select
                        value={condition}
                        onValueChange={(v) =>
                          setCondition(v as ProductCondition)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    <Label htmlFor="negotiable">Price Negotiable</Label>
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
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Housing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                      <Input
                        id="rent"
                        type="number"
                        placeholder="0"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room Type</Label>
                      <Select value={roomType} onValueChange={setRoomType}>
                        <SelectTrigger>
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
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Area, Landmark"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
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
                    <Label>Amenities</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add amenity"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addAmenity()}
                      />
                      <Button type="button" onClick={addAmenity}>
                        Add
                      </Button>
                    </div>
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary">
                            {amenity}
                            <button
                              className="ml-1"
                              onClick={() =>
                                setAmenities((a) =>
                                  a.filter((_, idx) => idx !== i)
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunity Fields */}
            {selectedType === "opportunity" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Opportunity Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={opportunityType}
                        onValueChange={setOpportunityType}
                      >
                        <SelectTrigger>
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
                      <Label htmlFor="company">Company/Org</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          placeholder="Company name"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oppLocation">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="oppLocation"
                          placeholder="City"
                          value={oppLocation}
                          onChange={(e) => setOppLocation(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <Switch
                        id="remote"
                        checked={isRemote}
                        onCheckedChange={setIsRemote}
                      />
                      <Label htmlFor="remote">Remote</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="deadline"
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stipend">Stipend (₹/month)</Label>
                      <Input
                        id="stipend"
                        type="number"
                        placeholder="0"
                        value={stipend}
                        onChange={(e) => setStipend(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="duration"
                        placeholder="e.g., 3 months"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Fields */}
            {selectedType === "community" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Post Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Post Type</Label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger>
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

                  {/* Poll Options */}
                  {postType === "poll" && (
                    <div className="space-y-2">
                      <Label>Poll Options</Label>
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                              updatePollOption(index, e.target.value)
                            }
                          />
                          {index > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setPollOptions((opts) =>
                                  opts.filter((_, i) => i !== index)
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 6 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                        >
                          Add Option
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Add tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                          className="pl-10"
                        />
                      </div>
                      <Button type="button" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            #{tag}
                            <button
                              className="ml-1"
                              onClick={() =>
                                setTags((t) => t.filter((_, idx) => idx !== i))
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
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
