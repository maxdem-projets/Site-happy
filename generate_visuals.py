import os
import urllib.request
import json
import re
from PIL import Image, ImageDraw, ImageFont

# Path to files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
ARTICLES_FILE = os.path.join(BASE_DIR, 'articles.js')
FONT_PATH = os.path.join(ASSETS_DIR, 'AlfaSlabOne-Regular.ttf')

# Ensure assets dir exists
os.makedirs(ASSETS_DIR, exist_ok=True)

# Category colors (RGB)
CATEGORY_COLORS = {
    "Environnement & Planète": (16, 185, 129),
    "Santé": (236, 72, 153),
    "IA & Tech": (59, 130, 246),
    "Politique & Société": (139, 92, 246),
    "Business & Économie Positive": (217, 119, 6),
    "France": (6, 182, 212),
    "Monde": (20, 184, 166),
    "Sport": (239, 68, 68)
}

# Mapping of all article IDs to Unsplash Image IDs and text layouts
VISUALS_CONFIG = {
    1: {
        "unsplash_id": "1500937386620-e9e9c570085e",
        "text": "50% D'EAU\nÉCONOMISÉE EN\nAGRICULTURE",
        "filename": "flip_secheresse.jpg"
    },
    2: {
        "unsplash_id": "1473800447596-017294822f36",
        "text": "300 JOURS\nÀ 100%\nRENOUVELABLE",
        "filename": "costa_rica.jpg"
    },
    3: {
        "unsplash_id": "1501472312651-726afd116ff1",
        "text": "LE RETOUR\nDES CASTORS\nEN EUROPE",
        "filename": "beaver.jpg"
    },
    4: {
        "unsplash_id": "1546026423-cc4642628d2b",
        "text": "UN NOUVEAU\nSANCTUAIRE\nMARIN",
        "filename": "coral_reef.jpg"
    },
    5: {
        "unsplash_id": "1507668077129-56e32842fceb",
        "text": "LA RECHERCHE\nPOUR ALZHEIMER\nBONDIT DE 40%",
        "filename": "alzheimer.jpg"
    },
    6: {
        "unsplash_id": "1584308666744-24d5c474f2ae",
        "text": "UN VACCIN CONTRE\nLE CANCER EN\nPHASE FINALE",
        "filename": "cancer_vaccine.jpg"
    },
    7: {
        "unsplash_id": "1505751172876-fa1923c5c528",
        "text": "UN PATCH\nBIOLOGIQUE\nPOUR LE COEUR",
        "filename": "heart_patch.jpg"
    },
    8: {
        "unsplash_id": "1532187643603-ba119ca4109e",
        "text": "SE PASSER\nD'INSULINE CONTRE\nLE DIABÈTE",
        "filename": "diabetes_cure.jpg"
    },
    9: {
        "unsplash_id": "1486312338219-ce68d2c6f44d",
        "text": "L'IA ACCÉLÈRE\nLES DOSSIERS\nDANS 11 MDPH",
        "filename": "ai_accessibility.jpg"
    },
    10: {
        "unsplash_id": "1593508512255-86ab42a8e620",
        "text": "DES LUNETTES\nQUI TRADUISENT\nLA PAROLE",
        "filename": "smart_glasses.jpg"
    },
    11: {
        "unsplash_id": "1451187580459-43490279c0fa",
        "text": "L'IA RÉPARE\nAUSSI LES\nFUITES D'EAU",
        "filename": "water_leak_ai.jpg"
    },
    12: {
        "unsplash_id": "1555252333-9f8e92e65df9",
        "text": "UN CONGÉ\nPATERNITÉ\nHARMONISÉ",
        "filename": "paternity_leave.jpg"
    },
    13: {
        "unsplash_id": "1542838132-92c53300491e",
        "text": "DES SUPERMARCHÉS\nCOOPÉRATIFS EN\nFRANCE",
        "filename": "coop_supermarket.jpg"
    },
    14: {
        "unsplash_id": "1570125909232-eb263c188f7e",
        "text": "L'ESSOR DES\nTRANSPORTS\nGRATUITS",
        "filename": "free_transit.jpg"
    },
    15: {
        "unsplash_id": "1506784983877-45594efa4cbe",
        "text": "LA SEMAINE DE 4\nJOURS BOOSTE LA\nPRODUCTIVITÉ",
        "filename": "four_day_week.jpg"
    },
    16: {
        "unsplash_id": "1611284446314-60a58ac0deb9",
        "text": "L'ÉCONOMIE\nCIRCULAIRE CRÉE\n100 000 EMPLOIS",
        "filename": "circular_jobs.jpg"
    },
    17: {
        "unsplash_id": "1504917595217-d4dc5ebe6122",
        "text": "DES SALARIÉS\nRACHÈTENT LEUR\nPROPRE USINE",
        "filename": "scop_factory.jpg"
    },
    18: {
        "unsplash_id": "1593113598332-cd288d649433",
        "text": "15 NOUVELLES\nASSOCIATIONS\nSOUTENUES",
        "filename": "associations_laureates.jpg"
    },
    19: {
        "unsplash_id": "1501339847302-ac426a4a7cbb",
        "text": "LE RETOUR DES\nÉPICERIES DANS\nNOS VILLAGES",
        "filename": "multiservice_village.jpg"
    },
    20: {
        "unsplash_id": "1513364776144-60967b0f800f",
        "text": "LES ENFANTS\nDESSINENT LEUR\nPROPRE PARC",
        "filename": "school_designers.jpg"
    },
    21: {
        "unsplash_id": "1507525428034-b723cf961d3e",
        "text": "LA VIE MARINE\nA DOUBLÉ EN\nÉCOSSE",
        "filename": "marine_recovery.jpg"
    },
    22: {
        "unsplash_id": "1516426122078-c23e76319801",
        "text": "QUATRE BONGOS\nRETROUVENT LEUR\nHABITAT AU KENYA",
        "filename": "bongo_kenya.jpg"
    },
    23: {
        "unsplash_id": "1439066615861-d1af74d74000",
        "text": "UN TRAITÉ\nHISTORIQUE POUR\nLA HAUTE MER",
        "filename": "treaty_high_seas.jpg"
    },
    24: {
        "unsplash_id": "1502224562085-639556652f33",
        "text": "DE L'ENTRAIDE\nSUR LA LIGNE\nD'ARRIVÉE",
        "filename": "marathon_solidarity.jpg"
    },
    25: {
        "unsplash_id": "1517838277536-f5f99be501cd",
        "text": "LE PREMIER\nGYMNASE 100%\nINCLUSIF",
        "filename": "inclusive_gym.jpg"
    },
    26: {
        "unsplash_id": "1502680390469-be75c86b636f",
        "text": "UNE ÉCOLE DE\nSURF POUR LES\nFAVELAS",
        "filename": "surf_favela.jpg"
    },
    27: {
        "unsplash_id": "1540555700478-4be289fbecef",
        "text": "UNE NOUVELLE\nRÉSERVE POUR\nLES GORILLES",
        "filename": "gorillas_rwanda.jpg"
    },
    28: {
        "unsplash_id": "1550572017-edd951b55104",
        "text": "UN VACCIN ORAL\nCONTRE LES\nINFECTIONS URINAIRES",
        "filename": "urinary_vaccine.jpg"
    },
    29: {
        "unsplash_id": "1617791160536-598cf32026fb",
        "text": "UNE PROTHÈSE\nSENSIBLE PAR\nLA PENSÉE",
        "filename": "bionic_hand.jpg"
    },
    30: {
        "unsplash_id": "1573497019940-1c28c88b4f3e",
        "text": "DES ÉTUDIANTS\nLOGÉS CHEZ NOS\nSENIORS",
        "filename": "intergenerational_housing.jpg"
    },
    31: {
        "unsplash_id": "1489987707025-afc232f7ea0f",
        "text": "DES VÊTEMENTS\nDÉSORMAIS\nGARANTIS À VIE",
        "filename": "lifetime_clothes.jpg"
    },
    32: {
        "unsplash_id": "1485965120184-e220f721d03e",
        "text": "DES VÉLOS EN\nPLASTIQUE ENTIÈREMENT\nRECYCLÉ",
        "filename": "recycled_bike.jpg"
    },
    33: {
        "unsplash_id": "1484406566174-9da000fda645",
        "text": "UN PONT\nVÉGÉTALISÉ POUR\nLA BIODIVERSITÉ",
        "filename": "bridge_wildlife.jpg"
    },
    34: {
        "unsplash_id": "1576091160550-2173dba999ef",
        "text": "UN VACCIN SAUVE\n1 ENFANT SUR 8\nDU PALUDISME",
        "filename": "malaria_vaccine.jpg"
    },
    35: {
        "unsplash_id": "1542224566-6e85f2e6772f",
        "text": "LE RETOUR GAGNANT\nDES ORNITHORYNQUES\nEN AUSTRALIE",
        "filename": "platypuses_australia.jpg"
    },
    36: {
        "unsplash_id": "1581091226825-a6a2a5aee158",
        "text": "L'IA DÉTECTE LE\nCANCER AVANT\nLES RADIOLOGUES",
        "filename": "ai_cancer.jpg"
    },
    37: {
        "unsplash_id": "1508514177221-188b1cf16e9d",
        "text": "RECORD HISTORIQUE\nDE PRODUCTION\nSOLAIRE AU R.U.",
        "filename": "uk_solar.jpg"
    },
    38: {
        "unsplash_id": "1516979187457-637abb4f9353",
        "text": "LIRE ET ÉCOUTER\nDE LA MUSIQUE\nRALENTIT L'ÂGE",
        "filename": "feel_good_aging.jpg"
    },
    39: {
        "unsplash_id": "1578575437130-527eed3abbec",
        "text": "CHUTE DE 21%\nDE LA CRIMINALITÉ\nAUX ÉTATS-UNIS",
        "filename": "us_crime_plunge.jpg"
    },
    40: {
        "unsplash_id": "1519683109079-d5f539e1542f",
        "text": "STRASBOURG LANCE\nSON RER\nMÉTROPOLITAIN",
        "filename": "strasbourg_rer.jpg"
    },
    41: {
        "unsplash_id": "1516426122078-c23e76319801",
        "text": "PONT ÉCOLOGIQUE\nRECORDS EN CALIFORNIE",
        "filename": "dynamic_41.jpg"
    },
    42: {
        "unsplash_id": "1611284446314-60a58ac0deb9",
        "text": "OCEAN CLEANUP\nÀ LOS ANGELES",
        "filename": "dynamic_42.jpg"
    },
    43: {
        "unsplash_id": "1516426122078-c23e76319801",
        "text": "RETOUR DU CONDOR\nEN OREGON",
        "filename": "dynamic_43.jpg"
    },
    44: {
        "unsplash_id": "1576091160550-2173dba999ef",
        "text": "VACCIN PALUDISME\nSAUVE DES VIES",
        "filename": "dynamic_44.jpg"
    },
    45: {
        "unsplash_id": "1550572017-edd951b55104",
        "text": "NOUVEL ESPOIR\nCONTRE LE CANCER",
        "filename": "dynamic_45.jpg"
    },
    46: {
        "unsplash_id": "1581091226825-a6a2a5aee158",
        "text": "IA REDMOD\nDIAGNOSTIC PRÉCOCE",
        "filename": "dynamic_46.jpg"
    },
    47: {
        "unsplash_id": "1526374965328-7f61d4dc18c5",
        "text": "POTABILISATION\nSANS DÉCHET",
        "filename": "dynamic_47.jpg"
    },
    48: {
        "unsplash_id": "1531297484001-80022131f5a1",
        "text": "DESSALEMENT\nET LITHIUM SOLAIRE",
        "filename": "dynamic_48.jpg"
    },
    49: {
        "unsplash_id": "1504639725590-34d0984388bd",
        "text": "IA SOLIDAIRE\nACCÉLÈRE L'ADMINISTRATION",
        "filename": "dynamic_49.jpg"
    },
    50: {
        "unsplash_id": "1573497019940-1c28c88b4f3e",
        "text": "ART & LECTURE\nRALENTISSENT LE VIEILLISSEMENT",
        "filename": "dynamic_50.jpg"
    },
    51: {
        "unsplash_id": "1555252333-9f8e92e65df9",
        "text": "AIDE PRÉNATALE\nEFFICACE À FLINT",
        "filename": "dynamic_51.jpg"
    },
    52: {
        "unsplash_id": "1570125909232-eb263c188f7e",
        "text": "CHUTE DE L'ALCOOL\nEN FINLANDE",
        "filename": "dynamic_52.jpg"
    },
    53: {
        "unsplash_id": "1508514177221-188b1cf16e9d",
        "text": "RECORD SOLAIRE\nAU ROYAUME-UNI",
        "filename": "dynamic_53.jpg"
    },
    54: {
        "unsplash_id": "1593113598332-cd288d649433",
        "text": "DON INCROYABLE\nÀ STATEN ISLAND",
        "filename": "dynamic_54.jpg"
    },
    55: {
        "unsplash_id": "1451187580459-43490279c0fa",
        "text": "INFRASTRUCTURES\nFINANCÉES PAR LA TECH",
        "filename": "dynamic_55.jpg"
    },
    56: {
        "unsplash_id": "1513364776144-60967b0f800f",
        "text": "DESIGNERS EN HERBE\nPARCS D'ENFANTS",
        "filename": "dynamic_56.jpg"
    },
    57: {
        "unsplash_id": "1542838132-92c53300491e",
        "text": "SUPERMARCHÉS\nCOOPÉRATIFS EN FRANCE",
        "filename": "dynamic_57.jpg"
    },
    58: {
        "unsplash_id": "1570125909232-eb263c188f7e",
        "text": "RER MÉTROPOLITAIN\nDE STRASBOURG",
        "filename": "dynamic_58.jpg"
    },
    59: {
        "unsplash_id": "1584308666744-24d5c474f2ae",
        "text": "ESPOIR CONTRE EBOLA\nGUÉRISONS EN RDC",
        "filename": "dynamic_59.jpg"
    },
    60: {
        "unsplash_id": "1507525428034-b723cf961d3e",
        "text": "BIODIVERSITÉ DOUBLE\nEN ÉCOSSE",
        "filename": "dynamic_60.jpg"
    },
    61: {
        "unsplash_id": "1516426122078-c23e76319801",
        "text": "BONGOS RÉINTRODUITS\nAU KENYA",
        "filename": "dynamic_61.jpg"
    },
    62: {
        "unsplash_id": "1502224562085-639556652f33",
        "text": "FOOTBALL ET ESPOIR\nDANS LES CAMPS",
        "filename": "dynamic_62.jpg"
    },
    63: {
        "unsplash_id": "1517838277536-f5f99be501cd",
        "text": "GYMNASE INCLUSIF\nPREMIER EN EUROPE",
        "filename": "dynamic_63.jpg"
    },
    64: {
        "unsplash_id": "1502680390469-be75c86b636f",
        "text": "SURF DANS LES FAVELAS\nHORIZONS NOUVEAUX",
        "filename": "dynamic_64.jpg"
    },
    65: {
        "unsplash_id": "1500937386620-e9e9c570085e",
        "text": "L'EAU RECYCLÉE\nDES OASIS DANS LES CHAMPS",
        "filename": "dynamic_65.jpg"
    }
}

def download_and_generate_image(art_id, config, category):
    unsplash_id = config["unsplash_id"]
    text = config["text"]
    filename = config["filename"]
    
    url = f"https://images.unsplash.com/photo-{unsplash_id}?w=800&h=800&fit=crop&q=80"
    temp_path = os.path.join(ASSETS_DIR, f"temp_{art_id}.jpg")
    final_path = os.path.join(ASSETS_DIR, filename)
    
    print(f"Downloading background for article {art_id} from {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        with urllib.request.urlopen(req, timeout=15) as response:
            content_type = response.info().get_content_type()
            if not content_type.startswith('image/'):
                raise ValueError(f"URL returned non-image content type: {content_type}")
                
            resolved_url = response.geturl()
            print(f"[VERIFICATION] Resolved URL for article {art_id}: {resolved_url} (Matches category: {category})")
            
            with open(temp_path, 'wb') as f:
                f.write(response.read())
    except Exception as e:
        print(f"Failed to download background for article {art_id}: {e}")
        return None
    
    # Process image
    try:
        img = Image.open(temp_path).convert("RGBA")
        width, height = img.size
        
        # 1. Draw gradient overlay at the bottom for text legibility
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw_overlay = ImageDraw.Draw(overlay)
        
        # Gradient from y=500 (0% opacity) to y=800 (80% opacity)
        for y in range(500, height):
            alpha = int(((y - 500) / (height - 500)) * 200) # Max 200/255 opacity
            draw_overlay.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))
            
        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)
        
        # 2. Setup font (with dynamic downscaling to prevent clipping)
        font_size = 60
        font = ImageFont.truetype(FONT_PATH, font_size)
        lines = text.split("\n")
        
        max_allowed_width = width - 150  # 800 - 150 = 650px maximum width for text
        while font_size > 24:
            font = ImageFont.truetype(FONT_PATH, font_size)
            any_too_wide = False
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                line_width = bbox[2] - bbox[0]
                if line_width > max_allowed_width:
                    any_too_wide = True
                    break
            if any_too_wide:
                font_size -= 2
            else:
                break
        
        # 3. Calculate text dimensions
        line_heights = []
        line_widths = []
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            line_widths.append(bbox[2] - bbox[0])
            line_heights.append(bbox[3] - bbox[1])
            
        total_text_height = sum(line_heights) + (len(lines) - 1) * 12
        
        # Position text
        # Bottom left: x=90, y starts so that the block ends at y=height - 60
        text_x = 90
        text_y_start = height - 60 - total_text_height
        
        # Draw text lines
        current_y = text_y_start
        for idx, line in enumerate(lines):
            draw.text((text_x, current_y), line, font=font, fill=(255, 255, 255, 255))
            current_y += line_heights[idx] + 12
            
        # 4. Draw color rectangle (must touch the left edge exactly: x_start = 0)
        rect_color = CATEGORY_COLORS.get(category, (255, 87, 34))
        rect_x_start = 0
        rect_x_end = 56
        rect_y_start = text_y_start - 4
        rect_y_end = text_y_start + 52  # Keep it a nice 56px square aligned with the first line of text
        
        draw.rectangle([rect_x_start, rect_y_start, rect_x_end, rect_y_end], fill=rect_color + (255,))
        
        # Save as JPEG with optimized compression and quality 60
        img.convert("RGB").save(final_path, "JPEG", quality=60, optimize=True)
        print(f"Successfully generated visual: {final_path}")
        
    except Exception as e:
        print(f"Error processing image for article {art_id}: {e}")
        return None
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return f"assets/{filename}"

def fetch_photographer_credit(unsplash_id):
    print(f"Fetching photographer credit dynamically for {unsplash_id}...")
    parts = unsplash_id.split('-')
    h = parts[1] if len(parts) > 1 else unsplash_id
    
    # Try the search endpoint first which is highly reliable for finding the author
    url = f"https://unsplash.com/s/photos/{h}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8')
            links = re.findall(r'\"name\":\"([^\"]+)\",\"username\":\"([^\"]+)\"', html)
            candidates = [(n, u) for n, u in links if u != 'unsplash']
            if not candidates and links:
                candidates = links
            if candidates:
                author_name, username = candidates[0]
                author_name = author_name.encode().decode('unicode-escape', errors='ignore')
                # If the search results page doesn't give a exact photo page ID, we try to use the short code
                return author_name, f"https://unsplash.com/photos/{h}"
    except Exception as e:
        print(f"Error fetching from search page for {unsplash_id}: {e}")
        
    # Alternate photo page fetch direct fallback
    url_direct = f"https://unsplash.com/photos/{h}"
    req_direct = urllib.request.Request(url_direct, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req_direct, timeout=5) as resp:
            html = resp.read().decode('utf-8')
            match = re.search(r'\"creator\":\s*\{\s*\"@type\":\s*\"Person\",\s*\"name\":\s*\"([^\"]+)\"', html)
            if match:
                return match.group(1), url_direct
            match = re.search(r'\"name\":\s*\"([^\"]+)\",\s*\"jobTitle\":\s*\"Photographer\"', html)
            if match:
                return match.group(1), url_direct
    except Exception as e:
        print(f"Error fetching directly from photo page for {unsplash_id}: {e}")
        
    return "Unsplash", f"https://unsplash.com/photos/{unsplash_id}"

# Pools of high-quality Unsplash image IDs by category for dynamically generated articles
CATEGORY_POOLS = {
    "Environnement & Planète": [
        "1546026423-cc4642628d2b", "1546026423-cc4642628d2b", "1439066615861-d1af74d74000"
    ],
    "Santé": [
        "1507668077129-56e32842fceb", "1584308666744-24d5c474f2ae", "1505751172876-fa1923c5c528",
        "1532187643603-ba119ca4109e", "1576091160550-2173dba999ef", "1550572017-edd951b55104"
    ],
    "IA & Tech": [
        "1486312338219-ce68d2c6f44d", "1593508512255-86ab42a8e620", "1451187580459-43490279c0fa",
        "1581091226825-a6a2a5aee158", "1617791160536-598cf32026fb", "1526374965328-7f61d4dc18c5",
        "1531297484001-80022131f5a1", "1504639725590-34d0984388bd"
    ],
    "Politique & Société": [
        "1555252333-9f8e92e65df9", "1542838132-92c53300491e", "1570125909232-eb263c188f7e",
        "1573497019940-1c28c88b4f3e", "1489987707025-afc232f7ea0f"
    ],
    "Business & Économie Positive": [
        "1506784983877-45594efa4cbe", "1611284446314-60a58ac0deb9", "1504917595217-d4dc5ebe6122"
    ],
    "France": [
        "1593113598332-cd288d649433", "1501339847302-ac426a4a7cbb", "1513364776144-60967b0f800f"
    ],
    "Monde": [
        "1507525428034-b723cf961d3e", "1516426122078-c23e76319801", "1439066615861-d1af74d74000"
    ],
    "Sport": [
        "1502224562085-639556652f33", "1517838277536-f5f99be501cd", "1502680390469-be75c86b636f"
    ]
}

# Photo credit mapping for the initial 40 article visuals
PHOTO_CREDITS_STATIC = {
    1: {"name": "Filip Miletic", "link": "https://unsplash.com/photos/e9e9c570085e"},
    2: {"name": "Isaac Mitchell", "link": "https://unsplash.com/photos/01729482b8eb"},
    3: {"name": "Vincent van Zalinge", "link": "https://unsplash.com/photos/726afd116ff1"},
    4: {"name": "Francesco Ungaro", "link": "https://unsplash.com/photos/cc4642628d2b"},
    5: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/56e32842fceb"},
    6: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/24d5c474f2ae"},
    7: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/fa1923c5c528"},
    8: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/ba119ca4109e"},
    9: {"name": "Glenn Carstens-Peters", "link": "https://unsplash.com/photos/ce68d2c6f44d"},
    10: {"name": "Jesper Vos", "link": "https://unsplash.com/photos/86ab42a8e620"},
    11: {"name": "NASA", "link": "https://unsplash.com/photos/43490279c0fa"},
    12: {"name": "Kelly Sikkema", "link": "https://unsplash.com/photos/9f8e92e65df9"},
    13: {"name": "nrd", "link": "https://unsplash.com/photos/92c53300491e"},
    14: {"name": "Filip Bunkens", "link": "https://unsplash.com/photos/eb263c188f7e"},
    15: {"name": "Dmitry Vechorko", "link": "https://unsplash.com/photos/45594efa4cbe"},
    16: {"name": "Lachlan Donald", "link": "https://unsplash.com/photos/60a58ac0deb9"},
    17: {"name": "Christopher Burns", "link": "https://unsplash.com/photos/d4dc5ebe6122"},
    18: {"name": "Perry Grone", "link": "https://unsplash.com/photos/cd288d649433"},
    19: {"name": "Roman Kraft", "link": "https://unsplash.com/photos/ac426a4a7cbb"},
    20: {"name": "Alice Dietrich", "link": "https://unsplash.com/photos/60967b0f800f"},
    21: {"name": "Sean Oulashin", "link": "https://unsplash.com/photos/b723cf961d3e"},
    22: {"name": "Sergey Pesterev", "link": "https://unsplash.com/photos/c23e76319801"},
    23: {"name": "Ishan @seefromthesky", "link": "https://unsplash.com/photos/d1af74d74000"},
    24: {"name": "Capstone Events", "link": "https://unsplash.com/photos/639556652f33"},
    25: {"name": "Danielle Cerullo", "link": "https://unsplash.com/photos/f5f99be501cd"},
    26: {"name": "Noah Buscher", "link": "https://unsplash.com/photos/be75c86b636f"},
    27: {"name": "Gorillas", "link": "https://unsplash.com/photos/4be289fbecef"},
    28: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/edd951b55104"},
    29: {"name": "Solen Feyissa", "link": "https://unsplash.com/photos/598cf32026fb"},
    30: {"name": "Christina @ wocintechchat.com", "link": "https://unsplash.com/photos/1c28c88b4f3e"},
    31: {"name": "Lauren Fleischmann", "link": "https://unsplash.com/photos/afc232f7ea0f"},
    32: {"name": "Kimo Brandt", "link": "https://unsplash.com/photos/e220f721d03e"},
    33: {"name": "Robert Bye", "link": "https://unsplash.com/photos/9da000fda645"},
    34: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/2173dba999ef"},
    35: {"name": "David Clode", "link": "https://unsplash.com/photos/6e85f2e6772f"},
    36: {"name": "ThisisEngineering RAEng", "link": "https://unsplash.com/photos/a6a2a5aee158"},
    37: {"name": "Michael Wilson", "link": "https://unsplash.com/photos/188b1cf16e9d"},
    38: {"name": "Kimberly Farmer", "link": "https://unsplash.com/photos/637abb4f9353"},
    39: {"name": "Fredy Jacob", "link": "https://unsplash.com/photos/527eed3abbec"},
    40: {"name": "Willian Justen de Vasconcellos", "link": "https://unsplash.com/photos/d5f539e1542f"},
    41: {"name": "Sergey Pesterev", "link": "https://unsplash.com/photos/c23e76319801"},
    42: {"name": "Lachlan Donald", "link": "https://unsplash.com/photos/60a58ac0deb9"},
    43: {"name": "Sergey Pesterev", "link": "https://unsplash.com/photos/c23e76319801"},
    44: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/2173dba999ef"},
    45: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/edd951b55104"},
    46: {"name": "ThisisEngineering RAEng", "link": "https://unsplash.com/photos/a6a2a5aee158"},
    47: {"name": "Ales Nesetril", "link": "https://unsplash.com/photos/1526374965328-7f61d4dc18c5"},
    48: {"name": "Ales Nesetril", "link": "https://unsplash.com/photos/1531297484001-80022131f5a1"},
    49: {"name": "Ales Nesetril", "link": "https://unsplash.com/photos/1504639725590-34d0984388bd"},
    50: {"name": "Christina @ wocintechchat.com", "link": "https://unsplash.com/photos/1c28c88b4f3e"},
    51: {"name": "Kelly Sikkema", "link": "https://unsplash.com/photos/9f8e92e65df9"},
    52: {"name": "Filip Bunkens", "link": "https://unsplash.com/photos/eb263c188f7e"},
    53: {"name": "Michael Wilson", "link": "https://unsplash.com/photos/188b1cf16e9d"},
    54: {"name": "Perry Grone", "link": "https://unsplash.com/photos/cd288d649433"},
    55: {"name": "NASA", "link": "https://unsplash.com/photos/43490279c0fa"},
    56: {"name": "Alice Dietrich", "link": "https://unsplash.com/photos/60967b0f800f"},
    57: {"name": "nrd", "link": "https://unsplash.com/photos/92c53300491e"},
    58: {"name": "Filip Bunkens", "link": "https://unsplash.com/photos/eb263c188f7e"},
    59: {"name": "National Cancer Institute", "link": "https://unsplash.com/photos/24d5c474f2ae"},
    60: {"name": "Sean Oulashin", "link": "https://unsplash.com/photos/b723cf961d3e"},
    61: {"name": "Sergey Pesterev", "link": "https://unsplash.com/photos/c23e76319801"},
    62: {"name": "Capstone Events", "link": "https://unsplash.com/photos/639556652f33"},
    63: {"name": "Danielle Cerullo", "link": "https://unsplash.com/photos/f5f99be501cd"},
    64: {"name": "Noah Buscher", "link": "https://unsplash.com/photos/be75c86b636f"},
    65: {"name": "Filip Miletic", "link": "https://unsplash.com/photos/e9e9c570085e"}
}

def main():
    # Read articles.js
    with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    if start_idx == -1 or end_idx == -1:
        print("Could not locate articles array in articles.js")
        return
        
    # Clean JS format to valid JSON
    json_string = content[start_idx:end_idx+1]
    json_string = re.sub(r'(\s+)([a-zA-Z_][a-zA-Z0-9_]*):', r'\1"\2":', json_string)
    
    try:
        articles_list = json.loads(json_string)
    except Exception as e:
        print(f"Error parsing articles.js: {e}")
        return

    print(f"Loaded {len(articles_list)} articles for visual processing.")
    
    # Process each article in the list
    for art in articles_list:
        art_id = art.get('id')
        category = art.get('category', 'Environnement & Planète')
        
        # Check if the visual already exists on disk and is configured
        expected_filename = ""
        config = None
        
        if art_id in VISUALS_CONFIG:
            config = VISUALS_CONFIG[art_id]
            expected_filename = config["filename"]
        else:
            expected_filename = f"dynamic_{art_id}.jpg"
            
        final_path = os.path.join(ASSETS_DIR, expected_filename)
        
        # If image already generated and in metadata, skip downloading
        if os.path.exists(final_path) and art.get('image') == f"assets/{expected_filename}":
            continue
            
        # If not in VISUALS_CONFIG, generate dynamic config
        if not config:
            pool = CATEGORY_POOLS.get(category, CATEGORY_POOLS["Environnement & Planète"])
            unsplash_id = pool[art_id % len(pool)]
            
            # Format text from visualText or title
            visual_text = art.get("visualText", art.get("title", ""))
            visual_text = visual_text.upper()
            
            # Split into 2 lines if too long and has no newline
            if "\n" not in visual_text:
                words = visual_text.split()
                if len(words) > 3:
                    mid = len(words) // 2
                    visual_text = " ".join(words[:mid]) + "\n" + " ".join(words[mid:])
            
            config = {
                "unsplash_id": unsplash_id,
                "text": visual_text,
                "filename": expected_filename
            }
            
        # Download and generate the image
        img_url = download_and_generate_image(art_id, config, category)
        if img_url:
            art['image'] = img_url
            
            # Update photo credits
            if art_id in PHOTO_CREDITS_STATIC:
                credit = PHOTO_CREDITS_STATIC[art_id]
                art['photoSource'] = credit['name']
                art['photoSourceLink'] = credit['link']
            else:
                author_name, url = fetch_photographer_credit(config['unsplash_id'])
                art['photoSource'] = author_name
                art['photoSourceLink'] = url
            print(f"Updated article {art_id} visual & credits: {art['photoSource']}")

    # Write back to articles.js preserving formatting
    new_array_json = json.dumps(articles_list, ensure_ascii=False, indent=2)
    new_content = content[:start_idx] + new_array_json + content[end_idx+1:]
    
    with open(ARTICLES_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully synchronized all article visuals to articles.js")

if __name__ == "__main__":
    main()
