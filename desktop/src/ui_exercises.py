import tkinter as tk
from tkinter import ttk, messagebox, filedialog, Canvas
from datetime import datetime
from PIL import Image, ImageTk
import uuid
import json
import os
import re

from .db import connect
from .schema import SCHEMA_SQL, migrate_database
from .theme import COLORS

def now_iso():
    return datetime.utcnow().isoformat()

MUSCLE_GROUPS = ["Pecho", "Espalda", "Hombros", "Brazos", "Abdominales", "Piernas", "Glúteos"]
EQUIPMENT_TYPES = ["Mancuerna", "Barra", "Máquina", "Cable", "Peso corporal", "Otro"]

class BootstrapCard(tk.Frame):
    """Card estilo Bootstrap con sombra y bordes redondeados"""
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        self.configure(
            bg=COLORS["bg_secondary"],
            relief="flat",
            highlightthickness=0
        )
        
        # Efecto de sombra con frame exterior
        self.inner_frame = tk.Frame(self, bg=COLORS["bg_secondary"], relief="flat")
        self.inner_frame.pack(fill="both", expand=True, padx=1, pady=1)
        
        # Borde sutil
        self.configure(highlightbackground=COLORS["border"], highlightthickness=1)

class ExercisesUI(ttk.Frame):
    def __init__(self, master):
        super().__init__(master)
        self.conn = connect()
        self.conn.executescript(SCHEMA_SQL)
        self.conn.commit()
        migrate_database(self.conn)
        
        self.current_muscle_filter = None
        self.custom_exercises_path = os.path.expanduser("~/.rutinas_offline/custom_exercises")
        os.makedirs(self.custom_exercises_path, exist_ok=True)
        
        self.setup_ui()
        self.load_exercises()
    
    def setup_ui(self):
        """Configura la interfaz con diseño Bootstrap"""
        # ====== HEADER ======
        header = tk.Frame(self, bg=COLORS["bg_primary"], height=80)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_content = tk.Frame(header, bg=COLORS["bg_primary"])
        header_content.pack(fill="both", expand=True, padx=24, pady=16)
        
        # Título
        title = tk.Label(
            header_content,
            text="💪 Ejercicios",
            font=("Segoe UI", 24, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        title.pack(side="left")
        
        # Botón + Personalizado
        btn_new = tk.Button(
            header_content,
            text="+ Personalizado",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=16,
            pady=8,
            cursor="hand2",
            command=self.open_new_exercise
        )
        btn_new.pack(side="right")
        
        # ====== FILTROS (BOOTSTRAP STYLE) ======
        filters_section = tk.Frame(self, bg=COLORS["bg_primary"])
        filters_section.pack(fill="x", padx=24, pady=(0, 24))
        
        filter_title = tk.Label(
            filters_section,
            text="Grupos Musculares",
            font=("Segoe UI", 11, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        filter_title.pack(anchor="w", pady=(0, 12))
        
        # Frame para los botones
        muscle_btn_frame = tk.Frame(filters_section, bg=COLORS["bg_primary"])
        muscle_btn_frame.pack(fill="x")
        
        # Botón "Todos"
        self.create_filter_button(muscle_btn_frame, "Todos", lambda: self.filter_by_muscle(None)).pack(side="left", padx=4, pady=4)
        
        # Botones de grupos musculares
        for muscle in MUSCLE_GROUPS:
            self.create_filter_button(muscle_btn_frame, muscle, lambda m=muscle: self.filter_by_muscle(m)).pack(side="left", padx=4, pady=4)
        
        # ====== CONTENEDOR PRINCIPAL ======
        main_container = tk.Frame(self, bg=COLORS["bg_primary"])
        main_container.pack(fill="both", expand=True, padx=24, pady=(0, 24))
        
        # Canvas con scroll
        self.canvas = Canvas(
            main_container,
            bg=COLORS["bg_primary"],
            highlightthickness=0
        )
        self.canvas.pack(side="left", fill="both", expand=True)
        
        # Scrollbar estilo Bootstrap
        scrollbar = tk.Frame(main_container, bg=COLORS["bg_primary"], width=8)
        scrollbar.pack(side="right", fill="y", padx=(8, 0))
        scrollbar.pack_propagate(False)
        
        sb = ttk.Scrollbar(scrollbar, orient="vertical", command=self.canvas.yview)
        sb.pack(fill="y", expand=True)
        
        self.canvas.configure(yscrollcommand=sb.set)
        
        # Frame interno para cards
        self.inner_frame = tk.Frame(self.canvas, bg=COLORS["bg_primary"])
        self.canvas_window = self.canvas.create_window((0, 0), window=self.inner_frame, anchor="nw")
        
        # Bind para responsive
        self.canvas.bind("<Configure>", self.on_canvas_configure)
        self.inner_frame.bind("<Configure>", self.on_frame_configure)
        
        # Mouse wheel scroll
        self.canvas.bind("<MouseWheel>", self.on_mousewheel)
        self.canvas.bind("<Button-4>", self.on_mousewheel)
        self.canvas.bind("<Button-5>", self.on_mousewheel)
    
    def create_filter_button(self, parent, text, command):
        """Crea un botón de filtro estilo Bootstrap"""
        btn = tk.Button(
            parent,
            text=text,
            font=("Segoe UI", 9, "bold"),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=14,
            pady=6,
            cursor="hand2",
            command=command,
            activebackground=COLORS["accent"],
            activeforeground="#000",
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        return btn
    
    def on_canvas_configure(self, event):
        """Adapta el ancho del frame interno"""
        self.canvas.itemconfig(self.canvas_window, width=event.width)
    
    def on_frame_configure(self, event):
        """Actualiza scrollregion"""
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
    
    def on_mousewheel(self, event):
        """Scroll con rueda del ratón"""
        if event.num == 5 or event.delta < 0:
            self.canvas.yview_scroll(1, "units")
        elif event.num == 4 or event.delta > 0:
            self.canvas.yview_scroll(-1, "units")
    
    def load_exercises(self):
        """Carga ejercicios en grid Bootstrap"""
        # Limpiar
        for widget in self.inner_frame.winfo_children():
            widget.destroy()
        
        query = "SELECT id, name, muscle_group, equipment, image_uri, is_custom FROM exercises"
        params = []
        
        if self.current_muscle_filter:
            query += " WHERE muscle_group = ?"
            params.append(self.current_muscle_filter)
        
        query += " ORDER BY name ASC"
        
        cur = self.conn.execute(query, params)
        exercises = cur.fetchall()
        
        if not exercises:
            # Empty state
            empty_frame = tk.Frame(self.inner_frame, bg=COLORS["bg_primary"])
            empty_frame.pack(fill="both", expand=True, pady=60)
            
            empty_icon = tk.Label(empty_frame, text="🔍", font=("Arial", 64), bg=COLORS["bg_primary"])
            empty_icon.pack()
            
            empty_title = tk.Label(
                empty_frame,
                text="No hay ejercicios con estos filtros",
                font=("Segoe UI", 13, "bold"),
                fg=COLORS["text_primary"],
                bg=COLORS["bg_primary"]
            )
            empty_title.pack(pady=(16, 6))
            
            empty_subtitle = tk.Label(
                empty_frame,
                text="Intenta cambiar los filtros o crear uno personalizado",
                font=("Segoe UI", 10),
                fg=COLORS["text_secondary"],
                bg=COLORS["bg_primary"]
            )
            empty_subtitle.pack()
        else:
            # Grid de ejercicios
            grid_frame = tk.Frame(self.inner_frame, bg=COLORS["bg_primary"])
            grid_frame.pack(fill="both", expand=True)
            
            for idx, (ex_id, name, muscle, equipment, image_uri, is_custom) in enumerate(exercises):
                col = idx % 2
                row = idx // 2
                
                card = self.create_exercise_card(grid_frame, ex_id, name, muscle, equipment, image_uri, is_custom)
                card.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")
            
            grid_frame.columnconfigure(0, weight=1)
            grid_frame.columnconfigure(1, weight=1)
    
    def create_exercise_card(self, parent, ex_id, name, muscle, equipment, image_uri, is_custom):
        """Crea card estilo Bootstrap"""
        # Card container con borde y sombra
        card_frame = tk.Frame(
            parent,
            bg=COLORS["bg_secondary"],
            relief="flat",
            highlightbackground=COLORS["border"],
            highlightthickness=1
        )
        
        # Imagen
        img_frame = tk.Frame(card_frame, bg=COLORS["bg_tertiary"], height=140)
        img_frame.pack(fill="x", padx=0, pady=0)
        img_frame.pack_propagate(False)
        
        if image_uri and os.path.exists(image_uri):
            try:
                img = Image.open(image_uri)
                img.thumbnail((200, 140), Image.Resampling.LANCZOS)
                photo = ImageTk.PhotoImage(img)
                lbl = tk.Label(img_frame, image=photo, bg=COLORS["bg_tertiary"])
                lbl.image = photo
                lbl.pack(fill="both", expand=True)
            except:
                self.create_placeholder(img_frame)
        else:
            self.create_placeholder(img_frame)
        
        # Content frame
        content = tk.Frame(card_frame, bg=COLORS["bg_secondary"])
        content.pack(fill="both", expand=True, padx=16, pady=14)
        
        # Nombre
        name_lbl = tk.Label(
            content,
            text=name,
            font=("Segoe UI", 12, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            wraplength=140,
            justify="left"
        )
        name_lbl.pack(anchor="w", pady=(0, 10))
        
        # Metadata
        meta_frame = tk.Frame(content, bg=COLORS["bg_secondary"])
        meta_frame.pack(fill="x", pady=(0, 12))
        
        # Grupo muscular
        muscle_badge = tk.Label(
            meta_frame,
            text=f"🎯 {muscle}",
            font=("Segoe UI", 9),
            fg=COLORS["accent"],
            bg=COLORS["bg_secondary"]
        )
        muscle_badge.pack(anchor="w", pady=2)
        
        # Equipo
        equip_badge = tk.Label(
            meta_frame,
            text=f"⚙️  {equipment}",
            font=("Segoe UI", 9),
            fg=COLORS["accent"],
            bg=COLORS["bg_secondary"]
        )
        equip_badge.pack(anchor="w", pady=2)
        
        # Botones
        btn_frame = tk.Frame(content, bg=COLORS["bg_secondary"])
        btn_frame.pack(fill="x")
        
        if is_custom:
            btn_delete = tk.Button(
                btn_frame,
                text="🗑️  Eliminar",
                font=("Segoe UI", 9, "bold"),
                fg=COLORS["text_primary"],
                bg=COLORS["danger"],
                border=0,
                padx=10,
                pady=6,
                cursor="hand2",
                command=lambda: self.delete_exercise(ex_id, name)
            )
            btn_delete.pack(fill="x")
        else:
            tag_lbl = tk.Label(
                btn_frame,
                text="📚 Catálogo",
                font=("Segoe UI", 8, "bold"),
                fg="#000",
                bg=COLORS["accent"],
                padx=10,
                pady=5
            )
            tag_lbl.pack(fill="x")
        
        return card_frame
    
    def create_placeholder(self, parent):
        """Placeholder para ejercicios sin imagen"""
        lbl = tk.Label(
            parent,
            text="💪",
            font=("Arial", 36),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_tertiary"]
        )
        lbl.pack(fill="both", expand=True)
    
    def filter_by_muscle(self, muscle):
        """Filtra ejercicios"""
        self.current_muscle_filter = muscle
        self.load_exercises()
    
    def open_new_exercise(self):
        """Abre formulario nuevo ejercicio"""
        win = tk.Toplevel(self.master)
        win.title("Nuevo Ejercicio")
        win.geometry("550x420")
        win.resizable(False, False)
        
        # Background
        win.configure(bg=COLORS["bg_primary"])
        
        self.create_exercise_form(win, is_new=True)
    
    def create_exercise_form(self, win, is_new=True, exercise_id=None, initial_data=None):
        """Formulario estilo Bootstrap"""
        # Header del modal
        header = tk.Frame(win, bg=COLORS["accent"], height=50)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_lbl = tk.Label(
            header,
            text="Nuevo Ejercicio" if is_new else "Editar Ejercicio",
            font=("Segoe UI", 14, "bold"),
            fg="#000",
            bg=COLORS["accent"]
        )
        header_lbl.pack(fill="both", expand=True, padx=20)
        
        # Contenido
        content = tk.Frame(win, bg=COLORS["bg_primary"])
        content.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Nombre
        tk.Label(
            content,
            text="Nombre del ejercicio",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        entry_name = tk.Entry(
            content,
            font=("Segoe UI", 10),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            insertbackground=COLORS["accent"],
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        entry_name.pack(fill="x", pady=(0, 16))
        entry_name.insert(0, initial_data.get("name", "") if initial_data else "")
        
        # Grupo muscular
        tk.Label(
            content,
            text="Grupo muscular",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        muscle_var = tk.StringVar(value=initial_data.get("muscle_group", "Pecho") if initial_data else "Pecho")
        combo_muscle = ttk.Combobox(
            content,
            textvariable=muscle_var,
            values=MUSCLE_GROUPS,
            state="readonly",
            font=("Segoe UI", 10)
        )
        combo_muscle.pack(fill="x", pady=(0, 16))
        
        # Equipo
        tk.Label(
            content,
            text="Tipo de equipo",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        equipment_var = tk.StringVar(value=initial_data.get("equipment", "Mancuerna") if initial_data else "Mancuerna")
        combo_equip = ttk.Combobox(
            content,
            textvariable=equipment_var,
            values=EQUIPMENT_TYPES,
            state="readonly",
            font=("Segoe UI", 10)
        )
        combo_equip.pack(fill="x", pady=(0, 16))
        
        # Imagen (solo personalizado)
        if is_new or (initial_data and initial_data.get("is_custom")):
            tk.Label(
                content,
                text="Imagen (opcional)",
                font=("Segoe UI", 10, "bold"),
                fg=COLORS["text_primary"],
                bg=COLORS["bg_primary"]
            ).pack(anchor="w", pady=(0, 6))
            
            img_frame = tk.Frame(content, bg=COLORS["bg_primary"])
            img_frame.pack(fill="x", pady=(0, 16))
            
            self.selected_image_path = initial_data.get("image_uri") if initial_data else None
            lbl_img = tk.Label(
                img_frame,
                text="Sin seleccionar",
                font=("Segoe UI", 9),
                fg=COLORS["text_secondary"],
                bg=COLORS["bg_primary"]
            )
            lbl_img.pack(side="left", padx=(0, 8))
            
            def select_image():
                path = filedialog.askopenfilename(
                    filetypes=[("Imágenes", "*.png *.jpg *.jpeg"), ("Todos", "*.*")]
                )
                if path:
                    self.selected_image_path = path
                    lbl_img.configure(text=os.path.basename(path)[:20])
            
            btn_img = tk.Button(
                img_frame,
                text="Seleccionar imagen",
                font=("Segoe UI", 9, "bold"),
                fg="#000",
                bg=COLORS["accent"],
                border=0,
                padx=10,
                pady=6,
                cursor="hand2",
                command=select_image
            )
            btn_img.pack(side="left")
        
        # Botones
        btn_frame = tk.Frame(content, bg=COLORS["bg_primary"])
        btn_frame.pack(fill="x", side="bottom", pady=(20, 0))
        
        btn_cancel = tk.Button(
            btn_frame,
            text="Cancelar",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=16,
            pady=8,
            cursor="hand2",
            command=win.destroy,
            highlightthickness=1,
            highlightbackground=COLORS["border"]
        )
        btn_cancel.pack(side="left", padx=(0, 8))
        
        def save():
            name = entry_name.get().strip()
            muscle = muscle_var.get()
            equipment = equipment_var.get()
            
            if not name:
                messagebox.showerror("Error", "El nombre es requerido")
                return
            
            image_uri = None
            if is_new or (initial_data and initial_data.get("is_custom")):
                if hasattr(self, 'selected_image_path') and self.selected_image_path:
                    import shutil
                    ext = os.path.splitext(self.selected_image_path)[1]
                    new_name = f"{uuid.uuid4()}{ext}"
                    new_path = os.path.join(self.custom_exercises_path, new_name)
                    shutil.copy(self.selected_image_path, new_path)
                    image_uri = new_path
            
            if is_new:
                new_id = str(uuid.uuid4())
                ts = now_iso()
                self.conn.execute(
                    "INSERT INTO exercises (id, name, muscle_group, equipment, image_uri, is_custom, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (new_id, name, muscle, equipment, image_uri or "", 1, ts, ts)
                )
            else:
                ts = now_iso()
                update_query = "UPDATE exercises SET name=?, muscle_group=?, equipment=?, updated_at=?"
                params = [name, muscle, equipment, ts]
                
                if image_uri:
                    update_query += ", image_uri=?"
                    params.append(image_uri)
                
                update_query += " WHERE id=?"
                params.append(exercise_id)
                
                self.conn.execute(update_query, params)
            
            self.conn.commit()
            messagebox.showinfo("Éxito", "Ejercicio guardado ✅")
            win.destroy()
            self.load_exercises()
        
        btn_save = tk.Button(
            btn_frame,
            text="Guardar",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=16,
            pady=8,
            cursor="hand2",
            command=save
        )
        btn_save.pack(side="right")
    
    def delete_exercise(self, ex_id, name):
        """Elimina ejercicio personalizado"""
        if messagebox.askyesno("Confirmar", f"¿Eliminar '{name}'?"):
            self.conn.execute("DELETE FROM exercises WHERE id=?", (ex_id,))
            self.conn.commit()
            self.load_exercises()


