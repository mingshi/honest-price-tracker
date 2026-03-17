#!/usr/bin/env python3
"""Create PNG icons from scratch"""

from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    """Create a simple icon with green background and white $ symbol"""
    # Create image with green background
    img = Image.new('RGB', (size, size), color='#4CAF50')
    draw = ImageDraw.Draw(img)
    
    # Calculate font size (approximately 60% of icon size)
    font_size = int(size * 0.6)
    
    try:
        # Try to use a system font
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
    except:
        try:
            font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
    
    # Draw $ symbol in white, centered
    text = "$"
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]  # Adjust for baseline
    
    # Draw white text
    draw.text((x, y), text, fill='white', font=font)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"Created: {output_path} ({size}x{size})")

# Create all required sizes
create_icon(16, 'dist/assets/icons/icon16.png')
create_icon(48, 'dist/assets/icons/icon48.png')
create_icon(128, 'dist/assets/icons/icon128.png')

print("\n✅ All icons created successfully!")
