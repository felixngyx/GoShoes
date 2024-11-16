import { motion } from 'framer-motion';
import { FaUsers, FaAward, FaTrophy } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section - Gradient Background */}
      <div className="relative h-[500px] bg-gradient-to-r from-red-500 to-orange-400 rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-6xl font-black text-yellow-300 mb-8 drop-shadow-lg">
              THE NEW SNEAKERS COLLECTION
            </h1>
            <button className="bg-purple-600 text-white px-12 py-3 rounded-full text-xl font-bold hover:bg-purple-700">
              START
            </button>
          </motion.div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-24 h-24">
            <img src="https://png.pngtree.com/png-vector/20231230/ourmid/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-0 left-0">
            <img src="https://png.pngtree.com/png-vector/20231230/ourmid/pngtree-dropshipping-men-hole-sole-jogging-shoes-png-image_11389148.png" alt="" className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-yellow-400 mx-8 -mt-10 rounded-2xl shadow-xl">
        <div className="grid grid-cols-3 gap-4 p-6 text-center">
          <div>
            <h3 className="text-4xl font-black">22M+</h3>
            <p className="font-bold">USER TRUST US</p>
          </div>
          <div>
            <h3 className="text-4xl font-black">90K+</h3>
            <p className="font-bold">BRAND VISION</p>
          </div>
          <div>
            <h3 className="text-4xl font-black">5K+</h3>
            <p className="font-bold">AWARDS</p>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="my-16 px-8">
        <div className="flex items-center gap-8">
          <motion.div 
            className="flex-1"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
          >
            <h2 className="text-5xl font-black mb-4">TRENDING SHOES OF THE DAY</h2>
            <img src="https://static.vecteezy.com/system/resources/previews/043/345/236/non_2x/the-latest-in-running-shoe-fashion-on-transparent-background-png.png" alt="Trending Sneaker" className="w-full h-auto transform -rotate-12" />
          </motion.div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="px-8 my-16">
        <h2 className="text-5xl font-black mb-8">TOP COLLECTION</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: 'New Advanced Filter-equipped basketball shoes',
              image: 'https://png.pngtree.com/png-clipart/20230506/original/pngtree-sneakers-running-shoes-bright-colors-png-image_9145044.png',
              color: 'bg-orange-400'
            },
            {
              title: 'Multi White Casual Sneakers',
              image: '/shoe2.jpg',
              color: 'bg-lime-400'
            },
            {
              title: 'Desert Blue Casual Walking',
              image: '/shoe3.jpg',
              color: 'bg-yellow-400'
            }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className={`${item.color} rounded-xl p-6 aspect-square`}
              whileHover={{ scale: 1.05 }}
            >
              <img src={item.image} alt={item.title} className="w-full h-48 object-contain mb-4" />
              <p className="font-semibold">{item.title}</p>
              <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full">
                Shop
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-8 space-y-4 mb-16">
        {['PREMIUM COLLECTION', 'BEST ARRIVALS', 'CRAZY SHOES', 'LADIES SHOES'].map((category) => (
          <motion.div
            key={category}
            className="bg-gray-100 p-4 rounded-lg font-black text-2xl cursor-pointer"
            whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
          >
            {category}
          </motion.div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10">
        <div className="text-blue-300 opacity-20">✦</div>
      </div>
      <div className="fixed bottom-0 left-0 -z-10">
        <div className="text-pink-300 opacity-20">✦</div>
      </div>
    </div>
  );
};

export default AboutPage;
