# Tema Dark Modern (igual a React)

COLORS = {
    "bg_primary": "#0f0f0f",    # Negro
    "bg_secondary": "#1a1a1a",  # Gris oscuro
    "bg_tertiary": "#222222",   # Gris más claro
    "text_primary": "#ffffff",   # Blanco
    "text_secondary": "#999999", # Gris
    "text_tertiary": "#666666",  # Gris más oscuro
    "accent": "#00d4ff",         # Cyan
    "accent_hover": "#00b8d4",   # Cyan oscuro
    "danger": "#ff6b6b",         # Rojo
    "success": "#51cf66",        # Verde
    "border": "#333333",         # Borde
}

def configure_styles():
    """Configura estilos globales para tkinter"""
    from tkinter import ttk
    
    style = ttk.Style()
    
    # Tema general
    style.theme_use("clam")
    
    # Colores generales
    style.configure("TFrame", background=COLORS["bg_primary"])
    style.configure("TLabel", background=COLORS["bg_primary"], foreground=COLORS["text_primary"])
    style.configure("TButton", background=COLORS["bg_secondary"], foreground=COLORS["text_primary"])
    style.configure("TEntry", fieldbackground=COLORS["bg_secondary"], foreground=COLORS["text_primary"])
    style.configure("Treeview", background=COLORS["bg_secondary"], foreground=COLORS["text_primary"], 
                   fieldbackground=COLORS["bg_secondary"])
    style.configure("Treeview.Heading", background=COLORS["bg_tertiary"], foreground=COLORS["text_primary"])
    
    # Botones personalizados
    style.configure("Accent.TButton", background=COLORS["accent"], foreground=COLORS["bg_primary"])
    style.configure("Danger.TButton", background=COLORS["danger"], foreground=COLORS["text_primary"])
    
    # Entrada personalizada
    style.configure("TEntry", relief="flat", padding=8)
    
    return style
