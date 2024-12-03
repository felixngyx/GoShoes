import React, { useState } from 'react';
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
import { Edit, ImagePlus } from 'lucide-react';
import PageTitle from "../../components/admin/PageTitle";

const BannerSection = ({ title, items, onEdit }) => {
  return (
    <div className="mb-8">
      <Typography 
        variant="h4" 
        className="mb-4 text-gray-800 font-bold"
      >
        {title}
      </Typography>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((banner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group"
          >
            <Card 
              className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col items-center justify-center 
                p-6 bg-gradient-to-r from-gray-700 to-gray-900 
                text-white h-[250px] relative">
                <Typography 
                  variant="h5" 
                  className="text-center"
                >
                  {banner.name}
                </Typography>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton 
                    size="small" 
                    className="bg-white/20 hover:bg-white/30"
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

const BannerPage = () => {
  const [banners, setBanners] = useState({
    header: [
      { id: 1, name: 'Header Banner 1', title: '', imageUrl: '', redirectUrl: '' },
      { id: 2, name: 'Header Banner 2', title: '', imageUrl: '', redirectUrl: '' }
    ],
    footer: [
      { id: 3, name: 'Footer Banner 1', title: '', imageUrl: '', redirectUrl: '' },
      { id: 4, name: 'Footer Banner 2', title: '', imageUrl: '', redirectUrl: '' }
    ],
    product: [
      { id: 5, name: 'Product List Banner', title: '', imageUrl: '', redirectUrl: '' }
    ]
  });

  const [editingBanner, setEditingBanner] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setOpenEditModal(true);
  };

  const handleCloseModal = () => {
    setOpenEditModal(false);
    setEditingBanner(null);
  };

  const handleSaveBanner = () => {
    if (!editingBanner) return;

    // Update the banner in the state
    const updateBanners = (bannerGroup) => 
      bannerGroup.map(b => b.id === editingBanner.id ? editingBanner : b);

    setBanners({
      header: updateBanners(banners.header),
      footer: updateBanners(banners.footer),
      product: updateBanners(banners.product)
    });

    handleCloseModal();
  };

  const handleInputChange = (e) => {
    setEditingBanner({
      ...editingBanner,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBanner({
          ...editingBanner,
          imageUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageTitle title="Banner Management | Goshoes Admin" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
            <TextField
              name="title"
              label="Banner Title"
              fullWidth
              value={editingBanner?.title || ''}
              onChange={handleInputChange}
              variant="outlined"
            />
            
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
              
              {editingBanner?.imageUrl && (
                <img 
                  src={editingBanner.imageUrl} 
                  alt="Banner Preview" 
                  className="w-24 h-24 object-cover rounded"
                />
              )}
            </div>

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
          <Button onClick={handleSaveBanner} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BannerPage;