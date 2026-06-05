import urllib.request
import json
import xml.etree.ElementTree as ET
import re

feeds = [
    { "name": "Reddit UpliftingNews", "url": "https://www.reddit.com/r/UpliftingNews/.rss" },
    { "name": "UN News French", "url": "https://news.un.org/feed/subscribe/fr/news/all/rss.xml" }
]

ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

raw_stories = []

for feed in feeds:
    print(f"Fetching {feed['name']}...")
    try:
        req = urllib.request.Request(feed['url'], headers={'User-Agent': ua, 'Accept-Encoding': 'gzip'})
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            if response.info().get('Content-Encoding') == 'gzip':
                import gzip
                xml_data = gzip.decompress(xml_data)
            
        # Parse XML
        # Remove namespaces if any to simplify parsing
        xml_str = xml_data.decode('utf-8')
        xml_str = re.sub(' xmlns="[^"]+"', '', xml_str, count=1)
        root = ET.fromstring(xml_str)
        
        # Check if Atom feed (Reddit uses Atom, UN News uses RSS)
        if 'feed' in root.tag or root.tag.endswith('feed'):
            # Atom
            for entry in root.findall('.//entry'):
                title_elem = entry.find('title')
                link_elem = entry.find('link')
                content_elem = entry.find('content') or entry.find('summary')
                
                title = title_elem.text if title_elem is not None else ""
                link = link_elem.attrib.get('href') if link_elem is not None else ""
                content = content_elem.text if content_elem is not None else ""
                # Strip HTML tags from content
                content = re.sub('<[^<]+?>', '', content)
                
                raw_stories.append({
                    "title": title,
                    "content": content[:1000],
                    "link": link,
                    "sourceName": feed['name']
                })
        else:
            # RSS
            for item in root.findall('.//item'):
                title_elem = item.find('title')
                link_elem = item.find('link')
                desc_elem = item.find('description')
                
                title = title_elem.text if title_elem is not None else ""
                link = link_elem.text if link_elem is not None else ""
                content = desc_elem.text if desc_elem is not None else ""
                content = re.sub('<[^<]+?>', '', content)
                
                raw_stories.append({
                    "title": title,
                    "content": content[:1000],
                    "link": link,
                    "sourceName": feed['name']
                })
                
        print(f"Successfully parsed {feed['name']}")
    except Exception as e:
        print(f"Error fetching {feed['name']}: {e}")

# Save to JSON
with open('raw_stories.json', 'w', encoding='utf-8') as f:
    json.dump(raw_stories, f, ensure_ascii=False, indent=2)
print(f"Saved {len(raw_stories)} raw stories to raw_stories.json")
