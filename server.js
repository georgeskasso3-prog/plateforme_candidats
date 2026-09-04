const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();

// Utilise les variables de Vercel (plus sécurisé!)
const supabaseUrl = process.env.SUPABASE_URL || 'https://tubbfzlcgirkpuqzdblw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1YmJmZnpsY2dpcmtwdXF6ZGJsdyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUxNjI5MTUxMSwiZXhwIjoyMDY3MjA1MTUxMX0.EszIv4xCIGNvEwMzOyMTTiWXQo.XGQHJPWKBCNnLTLQ7UvWDYuXiUnApQKrfLI4-Gc3W2UI';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Config pour photos/vidéos/vocaux - on garde en mémoire pour envoyer à Supabase
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});
// PAGE D'ACCUEIL
app.get('/', (req, res) => res.redirect('/register'));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// --- UPLOAD QUI NE S'EFFACE PLUS + SE VOIR ---
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.json({ erreur: 'Pas de fichier' });
    
    const fileName = Date.now() + "-" + req.file.originalname.replace(/\s/g, '_');

    const { error } = await supabase.storage
      .from('gmk-medias')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) throw error;
    
        const { data } = supabase.storage.from('gmk-medias').getPublicUrl(fileName);
    
        // ICI C'EST CE QUI MANQUE POUR SE VOIR!
        await supabase.from('posts').insert({
          content: req.body.content || req.body.caption || '',
          author_name: req.body.author || 'GMK Arrow',
          media_url: data.publicUrl,
          media_type: req.file.mimetype
        });
    
        console.log("✅ Fichier sauvé pour toujours", data.publicUrl);
        res.json({ url: data.publicUrl, success: true });
      } catch (e) {
        console.error(e);
        res.json({ erreur: e.message });
      }
    });
      
      
          if (error) throw error;
      
          const { data } = supabase.storage.from('gmk-medias').getPublicUrl(fileName);
          
          console.log("✅ Fichier sauvé pour toujours:", data.publicUrl);
          res.json({ url: data.publicUrl, success: true });
      
        } catch(e) {
          console.log("Erreur upload:", e);
          res.json({ erreur: e.message });
        }
      });
      
      // --- GESTION USERS DANS SUPABASE (plus dans users.json) ---
      app.post('/api/register', async (req, res) => {
        try {
          const { data, error } = await supabase.from('users').insert([req.body]).select();
          if(error) throw error;
              res.json(data || []);
            } catch(e) {
              res.json({ erreur: e.message });
            }
          });
          
          app.get('/api/users', async (req, res) => {
            try {
              const { data, error } = await supabase.from('users').select('*');
              if(error) throw error;
              res.json(data || []);
            } catch(e) {
              res.json({ erreur: e.message });
            }
          });
          
          const PORT = process.env.PORT || 3000;
          app.listen(PORT, '0.0.0.0', () => console.log(`GMK ARROW sur ${PORT}`));
          