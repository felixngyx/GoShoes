import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Button,
  DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import { Edit, ImagePlus} from 'lucide-react';
import { toast } from 'react-toastify';
import PageTitle from "../../components/admin/PageTitle";
import axiosClient from '../../apis/axiosClient';
import uploadImageToCloudinary from '../../common/uploadCloudinary';

interface BannerType {
  id: number;
  title: string;
  image: string;
  url: string;
  position: string;
}

// BannerSection Component: Renders a grid of banners for a specific section
interface BannerSectionProps {
  title: string;
  items: BannerType[];
  onEdit: (banner: BannerType) => void;
}

const BannerSection = ({ title, items, onEdit }: BannerSectionProps) => {
  return ( 
    <div className="mb-8">
      <Typography 
        variant="h4" 
        className="mb-4 text-gray-800 font-bold"
      >
        {title}
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((banner, index) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group"
          >
            <Card 
              className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div 
                className="flex flex-col items-center justify-center 
                p-6 bg-gradient-to-r from-gray-700 to-gray-900 
                text-white h-[250px] relative overflow-hidden"
              >
                {/* Banner Image with Overlay */}
                {banner.image && (
                  <img 
                    src={`${banner.image}`} 
                    alt={banner.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}

                {/* Banner Title */}
                <Typography 
                  variant="h5" 
                  className="relative z-10 text-center"
                >
                  {banner.title}
                </Typography>

                {/* Edit Button */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton 
                    size="small" 
                    className="bg-white/20 hover:bg-white/30 mr-2"
                    onClick={() => onEdit(banner)}
                  >
                    <Edit className="text-white" size={20} />
                  </IconButton>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main BannerPage Component
const BannerPage = () => {
  // State to manage banners across different sections
  const [banners, setBanners] = useState<{
    header: BannerType[];
    footer: BannerType[];
    product: BannerType[];
  }>({
    header: [],
    footer: [],
    product: []
  });

  // State for managing the banner being edited
  interface EditingBanner {
    id: number;
    title: string;
    imageUrl: string;
    redirectUrl: string;
  }

  const [editingBanner, setEditingBanner] = useState<EditingBanner | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch banners when component mounts
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get('/banners');
        const bannerData = response.data.data;
        
        // Categorize banners based on their position
        setBanners({
          header: bannerData.filter((b: BannerType) => 
            ['home1', 'home2', 'home3'].includes(b.position)
          ),
          footer: bannerData.filter((b: BannerType) => 
            ['home4', 'home5'].includes(b.position)
          ),
          product: bannerData.filter((b: BannerType) => b.position === 'all1')
        });
      } catch (error) {
        toast.error('Failed to load banners');
        console.error('Banner fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Update the handler with type
  const handleEdit = (banner: BannerType) => {
    setEditingBanner({
      id: banner.id,
      title: banner.title,
      imageUrl: banner.image,
      redirectUrl: banner.url
    });
    setOpenEditModal(true);
  };

  // Close the edit modal
  const handleCloseModal = () => {
    setOpenEditModal(false);
    setEditingBanner(null);
  };

  // Handle input changes in the edit modal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingBanner(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value
      };
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const file = files[0];
    if (file) {
      try {
        const imageUrl = await uploadImageToCloudinary(file);
        setEditingBanner(prev => {
          if (!prev) return null;
          return {
            ...prev,
            imageUrl: imageUrl
          };
        });
        toast.success('Image uploaded successfully');
      } catch (error) {
        toast.error('Image upload failed');
        console.error('Image upload error:', error);
      }
    }
  };

  // Save banner changes
  const handleSaveBanner = async () => {
    if (!editingBanner) return;

    try {
      // Update banner via API
      const response = await axiosClient.put(`/banners/${editingBanner.id}`, {
        title: editingBanner.title,
        url: editingBanner.redirectUrl,
        image: editingBanner.imageUrl
      });
      
      // Get updated banner from response
      const updatedBanner = response.data.data;
      // Update local state with the response data
      setBanners(prev => ({
        header: prev.header.map((b) => b.id === updatedBanner.id ? updatedBanner : b),
        footer: prev.footer.map((b) => b.id === updatedBanner.id ? updatedBanner : b),
        product: prev.product.map((b) => b.id === updatedBanner.id ? updatedBanner : b)
      }));

      toast.success('Banner updated successfully!');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to update banner');
      console.error('Banner update error:', error);
    }
  };

  // Render loading state if banners are being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography variant="h6">Loading Banners...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageTitle title="Banner Management | Goshoes Admin" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Banner Sections */}
        <BannerSection 
          title="Home Page Header Banners" 
          items={banners.header}
          onEdit={handleEdit}
        />
        
        <BannerSection 
          title="Home Page Footer Banners" 
          items={banners.footer}
          onEdit={handleEdit}
        />
        
        <BannerSection 
          title="Product List Banner" 
          items={banners.product}
          onEdit={handleEdit}
        />
      </motion.div>

      {/* Edit Banner Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Banner</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            {/* Banner Title Input */}
            <TextField
              name="title"
              label="Banner Title"
              fullWidth
              value={editingBanner?.title || ''}
              onChange={handleInputChange}
              variant="outlined"
            />
            
            {/* Image Upload Section */}
            <div className="flex items-center space-x-4">
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="banner-image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="banner-image-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<ImagePlus />}
                >
                  Upload Image
                </Button>
              </label>
              
              {/* Image Preview */}
              {editingBanner?.imageUrl && (
                <img 
                  src={`${editingBanner.imageUrl}`} 
                  alt="Banner Preview" 
                  className="w-24 h-24 object-cover rounded"
                />
              )}
            </div>

            {/* Redirect URL Input */}
            <TextField
              name="redirectUrl"
              label="Redirect URL"
              fullWidth
              value={editingBanner?.redirectUrl || ''}
              onChange={handleInputChange}
              variant="outlined"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveBanner} 
            color="primary" 
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BannerPage;