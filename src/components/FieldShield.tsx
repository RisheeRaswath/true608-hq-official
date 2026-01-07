import { useState, useEffect } from "react";
import { Camera, MapPin, Clock, Upload, Check, ArrowRight, RotateCcw, ScanLine, LogOut, Plus, Loader2 } from "lucide-react";
import WeightIncrement from "./WeightIncrement";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Phase = "scan" | "asset" | "start-weight" | "end-weight" | "delta" | "complete";

interface CylinderData {
  id: string | null;
  qrCodeId: string;
  refrigerantType: string;
}

interface Asset {
  id: string;
  name: string;
  location: string | null;
  asset_type: string | null;
}

interface FieldShieldProps {
  onBack?: () => void;
  onSignOut?: () => void;
  isTechnician?: boolean;
}

const FieldShield = ({ onBack, onSignOut, isTechnician = false }: FieldShieldProps) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("scan");
  const [cylinder, setCylinder] = useState<CylinderData | null>(null);
  const [cylinderIdInput, setCylinderIdInput] = useState("");
  const [selectedRefrigerant, setSelectedRefrigerant] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [newAssetName, setNewAssetName] = useState("");
  const [showQuickAddAsset, setShowQuickAddAsset] = useState(false);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [startWeight, setStartWeight] = useState("0.0");
  const [endWeight, setEndWeight] = useState("0.0");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState<number>(0);

  // Master list of refrigerants for "Unknown" cylinders
  const REFRIGERANTS = [
    // Legacy
    "R-22",
    "R-134a",
    "R-404A",
    "R-407C",
    "R-410A",
    "R-507",
    // Modern / Next-Gen
    "R-32",
    "R-454B (Opteon XL41)",
    "R-454A",
    "R-448A (Solstice N40)",
    "R-449A",
  ];

  // Capture GPS in background with fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("GPS error:", error);
          // Fallback: Set to null so it doesn't block "Certify & Save"
          setGpsCoords(null);
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false, // Don't require high accuracy
        }
      );
    } else {
      // Geolocation not available
      setGpsCoords(null);
    }
  }, []);

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [cameraStream]);

  // Link video element srcObject to cameraStream when it changes
  useEffect(() => {
    if (videoRef && cameraStream) {
      videoRef.srcObject = cameraStream;
      videoRef.autoplay = true;
      videoRef.playsInline = true;
      videoRef.muted = true;
      videoRef.play().catch(err => {
        console.error("Video play error:", err);
      });
    }
  }, [videoRef, cameraStream]);

  // Check auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      
      console.log("=== AUTH SESSION CHECK ===");
      console.log("Session:", session);
      console.log("Session User:", session?.session?.user);
      console.log("Session Error:", error);
      
      if (!session?.session) {
        console.error("⚠️ ALERT: AUTH SESSION IS NULL");
        console.error("User is not authenticated. RLS policies will block database operations.");
      } else {
        console.log("✅ Session is valid. User ID:", session.session.user.id);
      }
    };

    checkSession();
  }, []);

  // Fetch assets on mount and refresh
  const fetchAssets = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Map assets to include name field (for compatibility)
        const mappedAssets = data.map((asset: any) => ({
          ...asset,
          name: asset.unit_name || asset.name || '',
        }));
        setAssets(mappedAssets);
      }
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if ((window as any).__photoStream) {
      ((window as any).__photoStream as MediaStream).getTracks().forEach(track => track.stop());
      (window as any).__photoStream = null;
    }
    setVideoElement(null);
  };

  const handleScan = async () => {
    setIsScanning(true);
    
    // Stop any existing stream first
    stopCameraStream();
    
    try {
      // Try environment camera first (back camera on mobile) with exact constraint
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        setCurrentFacingMode('environment');
      } catch (envError) {
        // Fallback to user-facing camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          setCurrentFacingMode('user');
        } catch (userError) {
          throw new Error("Camera access denied");
        }
      }
      
      if (stream) {
        setCameraStream(stream);
        
        // Get available devices for switching
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableDevices(videoDevices);
        
        // Create video element with proper attributes for mobile
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true; // Required for autoplay on mobile browsers
        video.style.width = '100%';
        video.style.maxWidth = '400px';
        video.style.margin = '0 auto';
        video.style.display = 'block';
        setVideoElement(video);
        
        toast({
          title: "Camera Active",
          description: "Camera stream active. Please manually enter the cylinder ID or scan QR code.",
        });
      }
      
      setIsScanning(false);
    } catch (error: any) {
      console.error("Camera access error:", error);
      setIsScanning(false);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access or manually enter the cylinder ID",
        variant: "destructive",
      });
    }
  };

  const handleSwitchCamera = async () => {
    // Stop current stream
    stopCameraStream();
    
    try {
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        toast({
          title: "No Cameras Found",
          description: "No video devices available",
          variant: "destructive",
        });
        return;
      }
      
      // Cycle to next device
      const nextIndex = (currentDeviceIndex + 1) % videoDevices.length;
      setCurrentDeviceIndex(nextIndex);
      const nextDevice = videoDevices[nextIndex];
      
      // Get stream with specific device ID
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: nextDevice.deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setCameraStream(stream);
      (window as any).__photoStream = stream;
      
      // Create video element with proper attributes
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true; // Required for autoplay on mobile
      video.style.width = '100%';
      video.style.maxWidth = '600px';
      video.style.margin = '0 auto';
      video.style.display = 'block';
      video.style.borderRadius = '8px';
      setVideoElement(video);
      
      // Update facing mode based on device label
      if (nextDevice.label.toLowerCase().includes('back') || nextDevice.label.toLowerCase().includes('rear')) {
        setCurrentFacingMode('environment');
      } else {
        setCurrentFacingMode('user');
      }
    } catch (error: any) {
      console.error("Camera switch error:", error);
      toast({
        title: "Camera Switch Failed",
        description: "Could not switch camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCylinderIdSubmit = async () => {
    if (!cylinderIdInput.trim()) {
      toast({
        title: "Cylinder ID Required",
        description: "Please enter a cylinder ID",
      });
      return;
    }

    // Check if cylinder exists in database
    try {
      const { data: existingCylinder, error } = await (supabase as any)
        .from('cylinders')
        .select('id, qr_code_id, gas_type')
        .eq('qr_code_id', cylinderIdInput.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        // Error other than "not found"
        console.error("Error checking cylinder:", error);
      }

      if (existingCylinder) {
        // Cylinder exists
        setCylinder({
          id: existingCylinder.id,
          qrCodeId: existingCylinder.qr_code_id,
          refrigerantType: existingCylinder.gas_type || 'Unknown',
        });
      } else {
        // New cylinder - create entry
        // CLEAN INSERT: Only basics - qr_code_id, gas_type (nullable), current_weight_lbs, current_weight_oz
        const insertPayload = {
          qr_code_id: cylinderIdInput.trim(),
          current_weight_lbs: 0, // Default to 0 if null
          current_weight_oz: 0, // Default to 0
          // gas_type is nullable - will be set when linked to asset or during service
        };

        const { data: newCylinder, error: createError } = await (supabase as any)
          .from('cylinders')
          .insert(insertPayload)
          .select('id, qr_code_id, gas_type')
          .single();

        if (createError) {
          console.error("Cylinder creation error:", createError);
          toast({
            title: "Cylinder Creation Failed",
            description: createError.message || "Could not create cylinder. Please try again.",
          });
          return;
        }

        // Success toast
        toast({
          title: "VAULT RECORD VERIFIED",
          description: `Cylinder ${newCylinder.qr_code_id} registered successfully`,
        });

        setCylinder({
          id: newCylinder.id,
          qrCodeId: newCylinder.qr_code_id,
          refrigerantType: newCylinder.gas_type || 'Unknown',
        });
      }

      // Move to asset selection phase
      setPhase("asset");
    } catch (err: any) {
      console.error("=== CYLINDER ID CHECK ERROR (CATCH BLOCK) ===");
      console.error("Cylinder ID check error:", err);
      toast({
        title: "Error",
        description: "Could not process cylinder ID. Please try again.",
      });
    }
  };

  const handleQuickAddAsset = async () => {
    if (!newAssetName.trim() || !user?.id) {
      return;
    }

    setIsAddingAsset(true);
    try {
      // Fetch user's company_id from profiles
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setIsAddingAsset(false);
        return;
      }

        const { data: newAsset, error } = await (supabase as any)
          .from('assets')
          .insert({
            unit_name: newAssetName.trim(), // Map to public.assets.unit_name
            asset_type: 'Chiller', // Default type
            // refrigerant_type is nullable - will be set when cylinder is linked or during service
            company_id: profile?.company_id || null, // Use company_id from user session
          })
          .select('id, unit_name, asset_type, refrigerant_type, company_id')
          .single();

      if (error) {
        console.error("Asset creation error:", error);
        toast({
          title: "Asset Creation Failed",
          description: error.message || "Could not create asset. Please try again.",
        });
        setIsAddingAsset(false);
        return;
      }

      // Refresh assets list from database to ensure consistency
      await fetchAssets();
      
      // Select the newly created asset
      setSelectedAssetId(newAsset.id);
      setNewAssetName("");
      setShowQuickAddAsset(false);
      setIsAddingAsset(false); // Reset button state
      
      toast({
        title: "ASSET VERIFIED & ADDED",
        description: "Asset added successfully",
      });
    } catch (err: any) {
      console.error("Asset creation error:", err);
      setIsAddingAsset(false); // Reset button state on error
      toast({
        title: "Asset Creation Failed",
        description: err.message || "Could not create asset. Please try again.",
      });
    }
  };

  const handleAssetConfirm = () => {
    // Asset is MANDATORY - require selection before proceeding
    if (!selectedAssetId) {
      toast({
        title: "Asset Required",
        description: "Please select an asset to protect the audit trail",
      });
      return;
    }
    setPhase("start-weight");
  };

  const handleStartWeightConfirm = () => {
    const weight = parseFloat(startWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid starting weight greater than 0",
      });
      return;
    }
    setPhase("end-weight");
  };

  const handleEndWeightConfirm = () => {
    const start = parseFloat(startWeight);
    const end = parseFloat(endWeight);
    
    if (isNaN(end) || end < 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid ending weight",
      });
      return;
    }
    
    setPhase("delta");
  };

  const handlePhotoCapture = async () => {
    // Stop any existing stream first
    stopCameraStream();
    
    try {
      // Try environment camera first (back camera on mobile) with exact constraint
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        setCurrentFacingMode('environment');
      } catch (envError) {
        // Fallback to user-facing camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          setCurrentFacingMode('user');
        } catch (userError) {
          throw new Error("Camera access denied");
        }
      }
      
      if (stream) {
        setCameraStream(stream);
        (window as any).__photoStream = stream;
        
        // Get available devices for switching
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableDevices(videoDevices);
        
        // Create video element with proper attributes for mobile
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true; // Required for autoplay on mobile browsers
        video.style.width = '100%';
        video.style.maxWidth = '600px';
        video.style.margin = '0 auto';
        video.style.display = 'block';
        video.style.borderRadius = '8px';
        setVideoElement(video);
        
        toast({
          title: "Camera Ready",
          description: "Position the scale and click 'Capture Photo' when ready",
        });
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture scale photo",
        variant: "destructive",
      });
    }
  };

  const handleCapturePhoto = () => {
    const stream = (window as any).__photoStream as MediaStream;
    const videoEl = videoElement;
    
    if (!videoEl || !stream) {
      toast({
        title: "Camera Not Ready",
        description: "Please click 'Take Photo' first",
        variant: "destructive",
      });
      return;
    }
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 1920;
    canvas.height = videoEl.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoEl) {
      ctx.drawImage(videoEl, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoPreview(dataUrl);
      setPhotoConfirmed(false);
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setVideoElement(null);
      (window as any).__photoStream = null;
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setPhotoConfirmed(false);
    setHasPhoto(false);
    setPhotoUrl(null);
    
    // Stop any existing camera stream
    stopCameraStream();
    
    handlePhotoCapture();
  };

  const handleConfirmPhoto = async () => {
    if (!photoPreview) {
      toast({
        title: "No Photo",
        description: "Please capture a scale photo before confirming",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingPhoto(true);

      // Convert data URL to Blob
      const response = await fetch(photoPreview);
      const blob = await response.blob();

      const fileName = `log_${Date.now()}.jpg`;

      const { data, error } = await (supabase as any)
        .storage
        .from('audit-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error("Photo upload error:", error);
        toast({
          title: "Photo Upload Failed",
          description: error.message || "Could not upload photo. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: publicUrlData } = await (supabase as any)
        .storage
        .from('audit-photos')
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData?.publicUrl || null;
      setPhotoUrl(publicUrl);
      setPhotoConfirmed(true);
      setHasPhoto(true);

      toast({
        title: "Photo Uploaded",
        description: "Scale photo stored in audit vault",
      });
    } catch (err: any) {
      console.error("Photo upload unexpected error:", err);
      toast({
        title: "Photo Upload Error",
        description: err.message || "Unexpected error while uploading photo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Convert lbs string (e.g., "25.5") to lbs and oz
  const convertWeightToLbsOz = (weightStr: string): { lbs: number; oz: number } => {
    const totalLbs = parseFloat(weightStr);
    const lbs = Math.floor(totalLbs);
    const oz = Math.round((totalLbs - lbs) * 16);
    return { lbs, oz };
  };

  const handleSubmit = async () => {
    if (!user || !cylinder) {
      toast({
        title: "Missing Data",
        description: "User or cylinder information is missing",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Store as decimal lbs (schema uses DECIMAL weight_lbs)
    const startLbsDecimal = parseFloat(startWeight);
    const endLbsDecimal = parseFloat(endWeight);

    // Validate weights
    if (isNaN(startLbsDecimal) || isNaN(endLbsDecimal) || startLbsDecimal <= 0 || endLbsDecimal < 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter valid weight values",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate net weight (start - end)
      const netWeightLbs = startLbsDecimal - endLbsDecimal;

      // Determine action type based on weight change - EXPLICITLY set to Charge or Recovery, NEVER null
      // If gas is added (end > start, netWeightLbs < 0), it's a Charge
      // If gas is removed (end < start, netWeightLbs > 0), it's a Recovery
      // Default to "Charge" if netWeightLbs is exactly 0
      const actionType: 'Charge' | 'Recovery' = netWeightLbs < 0 ? 'Charge' : 'Recovery';

      // CRITICAL: Validate payload before insert - use exact keys as Numbers
      const payload = {
        cylinder_id: cylinder.id,
        tech_id: user.id,
        start_weight_lbs: Number(startLbsDecimal),
        end_weight_lbs: Number(endLbsDecimal),
        net_weight_lbs: Number(netWeightLbs),
        asset_id: selectedAssetId || null,
        photo_url: photoUrl || null,
        gps_latitude: gpsCoords?.lat ? Number(gpsCoords.lat) : null,
        gps_longitude: gpsCoords?.lng ? Number(gpsCoords.lng) : null,
        action_type: actionType, // Explicitly 'Charge' or 'Recovery', never null
        logged_at: new Date().toISOString(), // Current ISO timestamp
        synced: true,
      };

      // Insert compliance log - explicit select to avoid 406 errors
      const { data: insertedLog, error } = await (supabase as any)
        .from('compliance_logs')
        .insert(payload)
        .select('id, cylinder_id, tech_id, start_weight_lbs, end_weight_lbs, net_weight_lbs, asset_id, photo_url, gps_latitude, gps_longitude, action_type, synced, logged_at')
        .single();

      if (error) {
        console.error("Compliance log insert error:", error);
        toast({
          title: "Save Failed",
          description: error.message || "Could not save compliance log. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      // Update cylinder's current weight and link to asset (if selected)
      if (cylinder.id) {
        const updatePayload: any = { 
          current_weight_lbs: endLbsDecimal,
        };
        
        // Link asset and sync refrigerant_type from asset
        if (selectedAssetId) {
          updatePayload.asset_id = selectedAssetId;
          
          // Fetch asset to get refrigerant_type
          const { data: assetData } = await (supabase as any)
            .from('assets')
            .select('refrigerant_type')
            .eq('id', selectedAssetId)
            .single();
          
          // Update cylinder's gas_type from asset's refrigerant_type if available
          if (assetData?.refrigerant_type) {
            updatePayload.gas_type = assetData.refrigerant_type;
          }
        }

        const { error: updateError } = await (supabase as any)
          .from('cylinders')
          .update(updatePayload)
          .eq('id', cylinder.id);

        if (updateError) {
          console.error("Cylinder update error:", updateError);
          // Don't fail the whole operation if cylinder update fails
        }
      }

      // SUCCESS: Show high-contrast green toast
      toast({
        title: "AUDIT SECURED IN TRUE608 VAULT",
        description: "Compliance log saved successfully",
      });

      // Clear all form fields but keep phase for success screen
      setCylinder(null);
      setCylinderIdInput("");
      setSelectedRefrigerant(""); // Wipe gas type selection
      setSelectedAssetId("");
      setStartWeight("0.0");
      setEndWeight("0.0");
      setHasPhoto(false);
      setPhotoPreview(null);
      setPhotoConfirmed(false);
      setPhotoUrl(null); // Wipe photo URL
      setShowQuickAddAsset(false);
      setNewAssetName("");
      setCurrentDeviceIndex(0); // Reset camera device index
      
      // Stop any camera streams
      stopCameraStream();
      
      setPhase("complete");
    } catch (err: any) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhase("scan");
    setCylinder(null);
    setCylinderIdInput("");
    setSelectedRefrigerant(""); // Wipe gas type selection
    setSelectedAssetId("");
    setStartWeight("0.0");
    setEndWeight("0.0");
    setHasPhoto(false);
    setPhotoPreview(null);
    setPhotoConfirmed(false);
    setPhotoUrl(null); // Wipe photo URL
    setShowQuickAddAsset(false);
    setNewAssetName("");
    setCurrentDeviceIndex(0); // Reset camera device index
    
    // Stop any camera streams
    stopCameraStream();
  };

  const handleLogAnother = () => {
    handleReset();
  };

  const handleExitToDashboard = () => {
    // Stop any camera streams
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if ((window as any).__photoStream) {
      ((window as any).__photoStream as MediaStream).getTracks().forEach(track => track.stop());
      (window as any).__photoStream = null;
    }
    
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/app/dashboard';
    }
  };

  const deltaWeight = (parseFloat(startWeight) - parseFloat(endWeight)).toFixed(1);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      {isTechnician ? (
        onSignOut && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={onSignOut}
              className="px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:bg-[#F97316] hover:text-black hover:border-[#F97316] transition-colors font-sans flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              SIGN OUT
            </button>
          </div>
        )
      ) : (
        onBack && phase !== "scan" && (
          <button
            onClick={() => {
              if (phase === "asset") {
                setPhase("scan"); // Select Asset → Scanner
              } else if (phase === "start-weight" || phase === "end-weight" || phase === "delta") {
                setPhase("asset"); // Weight Entry → Select Asset
              } else {
                onBack();
              }
            }}
            className="mb-4 px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:border-[#F97316]/50 transition-colors"
          >
            ← Back
          </button>
        )
      )}

      {/* SCAN PHASE */}
      {phase === "scan" && (
        <div className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-wide text-foreground">
              FIELD-SHIELD
            </h1>
            <p className="text-muted-foreground">EPA AIM Act Compliance Logging</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                Manually Enter Cylinder ID or Scan QR
              </Label>
              <Input
                type="text"
                value={cylinderIdInput}
                onChange={(e) => setCylinderIdInput(e.target.value)}
                placeholder="Enter cylinder ID (e.g., CYL-608-2024-0847)"
                className="bg-black border-zinc-800 text-white rounded-none h-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCylinderIdSubmit();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleCylinderIdSubmit}
              disabled={!cylinderIdInput.trim()}
              className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-black font-black h-14 rounded-none transition-all tracking-widest"
            >
              CONTINUE
            </Button>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="scan-button w-full"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
                {isScanning ? (
                  <>
                    <ScanLine className="w-8 h-8 md:w-10 md:h-10" />
                    <span>SCANNING...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 md:w-10 md:h-10" />
                    <span>SCAN QR CODE</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ASSET SELECTION PHASE */}
      {phase === "asset" && cylinder && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="card-industrial p-4 border-[#F97316]/50 space-y-2">
            <div>
              <p className="text-sm text-[#F97316] font-medium mb-1">CYLINDER IDENTIFIED</p>
              <p className="text-lg font-bold text-foreground">{cylinder.qrCodeId}</p>
              <p className="text-sm text-muted-foreground">
                {cylinder.refrigerantType && cylinder.refrigerantType !== "Unknown"
                  ? cylinder.refrigerantType
                  : "Gas Type: Unknown"}
              </p>
            </div>

            {/* Refrigerant selection when gas type is Unknown */}
            {(!cylinder.refrigerantType || cylinder.refrigerantType === "Unknown") && (
              <div className="pt-2 border-t border-zinc-800 mt-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">
                  Assign Refrigerant Type
                </Label>
                <Select
                  value={selectedRefrigerant}
                  onValueChange={async (value) => {
                    setSelectedRefrigerant(value);
                    if (cylinder) {
                      setCylinder({
                        ...cylinder,
                        refrigerantType: value,
                      });
                      if (cylinder.id) {
                        const { error } = await (supabase as any)
                          .from('cylinders')
                          .update({ gas_type: value })
                          .eq('id', cylinder.id);
                        if (error) {
                          console.error("Cylinder gas_type update error:", error);
                        }
                      }
                    }
                  }}
                >
                  <SelectTrigger className="bg-black border-zinc-800 text-white rounded-none h-10 text-xs">
                    <SelectValue placeholder="Select refrigerant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REFRIGERANTS.map((ref) => (
                      <SelectItem key={ref} value={ref}>
                        {ref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-black tracking-wide">SELECT ASSET</h2>
            <p className="text-muted-foreground text-sm">Choose the Chiller/AC unit for this service</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                Asset (Chiller/AC Unit)
              </Label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger className="bg-black border-zinc-800 text-white rounded-none h-12">
                  <SelectValue placeholder="Select an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} {asset.location && `(${asset.location})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!showQuickAddAsset ? (
              <Button
                onClick={() => setShowQuickAddAsset(true)}
                variant="outline"
                className="w-full border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-black rounded-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                QUICK ADD NEW ASSET
              </Button>
            ) : (
              <div className="card-industrial p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                    Asset Name
                  </Label>
                  <Input
                    type="text"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    placeholder="e.g., Main Hospital Chiller"
                    className="bg-black border-zinc-800 text-white rounded-none h-12"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleQuickAddAsset}
                    disabled={isAddingAsset || !newAssetName.trim()}
                    className="flex-1 bg-[#F97316] hover:bg-[#F97316]/90 text-black font-black rounded-none"
                  >
                    {isAddingAsset ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "ADD ASSET"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowQuickAddAsset(false);
                      setNewAssetName("");
                    }}
                    variant="outline"
                    className="flex-1 border-zinc-800 rounded-none"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleAssetConfirm}
              disabled={!selectedAssetId}
              className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-black font-black h-14 rounded-none transition-all tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PROCEED TO FINAL CERTIFICATION
            </Button>
          </div>
        </div>
      )}

      {/* START WEIGHT PHASE */}
      {phase === "start-weight" && cylinder && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="card-industrial p-4 border-[#F97316]/50">
            <p className="text-sm text-[#F97316] font-medium mb-1">CYLINDER IDENTIFIED</p>
            <p className="text-lg font-bold text-foreground">{cylinder.qrCodeId}</p>
            <p className="text-sm text-muted-foreground">{cylinder.refrigerantType}</p>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-black tracking-wide">PHASE 1: STARTING WEIGHT</h2>
            <p className="text-muted-foreground text-sm">Enter weight currently on scale</p>
          </div>

          <div className="card-industrial p-6 text-center">
            <div className="weight-display">
              {startWeight}
            </div>
            <p className="text-muted-foreground mt-2">LBS</p>
          </div>

          <WeightIncrement
            value={startWeight}
            onChange={setStartWeight}
            onConfirm={handleStartWeightConfirm}
          />
        </div>
      )}

      {/* END WEIGHT PHASE */}
      {phase === "end-weight" && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="card-industrial p-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">STARTING WEIGHT</p>
                <p className="text-xl font-bold text-foreground">{startWeight} LBS</p>
              </div>
              <ArrowRight className="w-6 h-6 text-[#F97316]" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">ENDING WEIGHT</p>
                <p className="text-xl font-bold text-[#F97316]">?</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-black tracking-wide">PHASE 2: ENDING WEIGHT</h2>
            <p className="text-muted-foreground text-sm">Enter weight after service complete</p>
          </div>

          <div className="card-industrial p-6 text-center">
            <div className="weight-display">
              {endWeight}
            </div>
            <p className="text-muted-foreground mt-2">LBS</p>
          </div>

          <WeightIncrement
            value={endWeight}
            onChange={setEndWeight}
            onConfirm={handleEndWeightConfirm}
          />
        </div>
      )}

      {/* DELTA REVEAL PHASE */}
      {phase === "delta" && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="card-industrial p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">REFRIGERANT CHARGED</p>
            <div className="weight-display">
              {deltaWeight}
            </div>
            <p className="text-2xl font-bold text-[#F97316] mt-2">LBS CHARGED</p>
          </div>

          <div className="card-industrial p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">START</p>
                <p className="text-lg font-bold">{startWeight} LBS</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">END</p>
                <p className="text-lg font-bold">{endWeight} LBS</p>
              </div>
            </div>
          </div>

          {/* Photo Preview & Actions */}
          {photoPreview && !photoConfirmed ? (
            <div className="space-y-4">
              <div className="card-industrial p-4">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">
                  Photo Preview
                </Label>
                <div className="relative w-full aspect-video bg-black rounded border border-zinc-800 overflow-hidden">
                  <img 
                    src={photoPreview} 
                    alt="Scale photo preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRetakePhoto}
                  variant="outline"
                  className="flex-1 border-zinc-800 rounded-none"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  RETAKE PHOTO
                </Button>
                <Button
                  onClick={handleConfirmPhoto}
                  disabled={isUploadingPhoto}
                  className="flex-1 bg-[#22C55E] hover:bg-[#22C55E]/90 text-white border-[#22C55E] rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      UPLOADING...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      CONFIRM PHOTO
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : photoConfirmed ? (
            <div className="card-industrial p-4 border-[#22C55E]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#22C55E]/20 flex items-center justify-center border-2 border-[#22C55E]">
                    <Check className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Photo Verified</p>
                    <p className="text-xs text-muted-foreground">
                      {photoUrl ? "Scale photo uploaded to audit vault" : "Scale photo confirmed"}
                    </p>
                  </div>
                </div>
                {photoUrl && (
                  <span className="px-3 py-1 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/60 text-[10px] font-black uppercase tracking-widest text-[#22C55E]">
                    Uploaded
                  </span>
                )}
                <Button
                  onClick={handleRetakePhoto}
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-foreground"
                >
                  Change
                </Button>
              </div>
            </div>
          ) : videoElement && cameraStream ? (
            <div className="space-y-4">
              <div className="card-industrial p-4">
                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">
                  Live Camera Preview
                </Label>
                <div className="relative w-full aspect-video bg-black rounded border border-zinc-800 overflow-hidden" style={{ minHeight: '200px', display: 'block' }}>
                  <video
                    ref={(el) => {
                      if (el) {
                        setVideoRef(el);
                      }
                    }}
                    className="w-full h-full object-contain"
                    style={{ display: 'block', width: '100%', height: '100%', minHeight: '200px' }}
                    autoPlay
                    playsInline
                    muted
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    stopCameraStream();
                  }}
                  variant="outline"
                  className="flex-1 border-zinc-800 rounded-none"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleSwitchCamera}
                  variant="outline"
                  className="border-zinc-800 rounded-none"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCapturePhoto}
                  className="flex-1 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white border-[#EF4444] rounded-none"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  CAPTURE PHOTO
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePhotoCapture}
              className="w-full h-16 border-2 border-[#EF4444] bg-[#EF4444] text-white rounded-none font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 py-4"
            >
              <Camera className="w-5 h-5" />
              ATTACH SCALE PHOTO
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-16 bg-[#F97316] border-2 border-[#F97316] text-black font-black uppercase tracking-wider text-lg rounded-none flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <MapPin className="w-6 h-6" />
                SEALING VAULT RECORD...
              </>
            ) : (
              <>
                <Check className="w-6 h-6" />
                CERTIFY & SAVE
              </>
            )}
          </button>

          <div className="card-industrial p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                GPS: {gpsCoords 
                  ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` 
                  : "Acquiring..."}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE PHASE - Full Screen "Record Sealed" Animation */}
      {phase === "complete" && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="space-y-8 text-center animate-fade-in max-w-md">
            {/* Solid Green Checkmark - No Animation */}
            <div className="w-40 h-40 mx-auto flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-[#22C55E]/20 flex items-center justify-center border-4 border-[#22C55E]">
                <Check className="w-20 h-20 text-[#22C55E]" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black tracking-wide text-[#F97316] uppercase">
                FEDERAL AUDIT RECORD SEALED
              </h2>
              <p className="text-lg text-zinc-400 mt-2">
                Compliance log secured in True608 Vault
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                onClick={handleLogAnother}
                className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white border-[#F97316] rounded-none py-6 text-lg font-black uppercase tracking-wide"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                LOG ANOTHER GAS/CYLINDER
              </Button>
              
              <Button
                onClick={handleExitToDashboard}
                variant="outline"
                className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-none py-6 text-lg font-bold uppercase tracking-wide"
                size="lg"
              >
                EXIT TO DASHBOARD
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldShield;
