import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
import uuid
import re

from .db import connect
from .schema import SCHEMA_SQL, migrate_database
from .theme import COLORS

def now_iso():
    return datetime.utcnow().isoformat()

def format_date_input(text, max_length=10):
    """Formatea entrada de fecha DD/MM/YYYY automáticamente"""
    numbers = re.sub(r'[^\d]', '', text)
    
    # Validar día
    if len(numbers) >= 2:
        day = int(numbers[:2])
        if day > 31:
            numbers = numbers[:1]
    
    # Validar mes
    if len(numbers) >= 4:
        month = int(numbers[2:4])
        if month > 12:
            numbers = numbers[:3]
    
    # Formatear
    if len(numbers) <= 2:
        formatted = numbers
    elif len(numbers) <= 4:
        formatted = numbers[:2] + "/" + numbers[2:]
    else:
        formatted = numbers[:2] + "/" + numbers[2:4] + "/" + numbers[4:8]
    
    return formatted

class AthletesUI(ttk.Frame):
    def __init__(self, master):
        super().__init__(master)
        self.conn = connect()
        self.conn.executescript(SCHEMA_SQL)
        self.conn.commit()
        migrate_database(self.conn)
        
        self.setup_ui()
        self.reload()
    
    def setup_ui(self):
        """Configura la interfaz estilo Bootstrap"""
        # ====== HEADER ======
        header = tk.Frame(self, bg=COLORS["bg_primary"], height=80)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_content = tk.Frame(header, bg=COLORS["bg_primary"])
        header_content.pack(fill="both", expand=True, padx=24, pady=16)
        
        # Título
        title = tk.Label(
            header_content,
            text="👥 Atletas",
            font=("Segoe UI", 24, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        title.pack(side="left")
        
        # Botón + Alta
        btn_new = tk.Button(
            header_content,
            text="+ Alta",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=16,
            pady=8,
            cursor="hand2",
            command=self.open_new_athlete
        )
        btn_new.pack(side="right")
        
        # ====== TABLA (BOOTSTRAP STYLE) ======
        table_frame = tk.Frame(self, bg=COLORS["bg_primary"])
        table_frame.pack(fill="both", expand=True, padx=24, pady=24)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(table_frame)
        scrollbar.pack(side="right", fill="y")
        
        # Treeview con styling mejorado
        self.tree = ttk.Treeview(
            table_frame,
            columns=("name", "age", "sex", "birth_date", "height", "weight"),
            show="headings",
            yscrollcommand=scrollbar.set,
            height=15
        )
        scrollbar.config(command=self.tree.yview)
        
        # Configurar columnas
        self.tree.heading("name", text="👤 Nombre")
        self.tree.heading("age", text="🎂 Edad")
        self.tree.heading("sex", text="⚡ Sexo")
        self.tree.heading("birth_date", text="📅 F. Nac.")
        self.tree.heading("height", text="📏 Altura")
        self.tree.heading("weight", text="⚖️ Peso")
        
        self.tree.column("name", width=180)
        self.tree.column("age", width=70, anchor="center")
        self.tree.column("sex", width=60, anchor="center")
        self.tree.column("birth_date", width=100, anchor="center")
        self.tree.column("height", width=80, anchor="center")
        self.tree.column("weight", width=80, anchor="center")
        
        self.tree.pack(fill="both", expand=True)
        
        # Bindings
        self.tree.bind("<Double-1>", self.on_double_click)
        self.tree.bind("<Delete>", self.on_delete)
    
    def reload(self):
        """Recarga la tabla de atletas"""
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        cur = self.conn.execute(
            "SELECT id, name, age, sex, birth_date, height, weight FROM athletes ORDER BY name ASC"
        )
        for row in cur.fetchall():
            _id = row[0]
            self.tree.insert("", "end", iid=_id, values=row[1:])
    
    def open_new_athlete(self):
        """Abre formulario para nuevo atleta"""
        win = tk.Toplevel(self.master)
        win.title("Nuevo Atleta")
        win.geometry("550x480")
        win.resizable(False, False)
        win.configure(bg=COLORS["bg_primary"])
        
        self.create_athlete_form(win, is_new=True)
    
    def create_athlete_form(self, win, is_new=True, athlete_id=None, initial_data=None):
        """Crea formulario de atleta estilo Bootstrap"""
        # Header del modal
        header = tk.Frame(win, bg=COLORS["accent"], height=50)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_lbl = tk.Label(
            header,
            text="Nuevo Atleta" if is_new else "Editar Atleta",
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
            text="Nombre",
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
        if initial_data:
            entry_name.insert(0, initial_data.get("name", ""))
        
        # Edad y Fecha de Nacimiento (lado a lado)
        row1 = tk.Frame(content, bg=COLORS["bg_primary"])
        row1.pack(fill="x", pady=(0, 16))
        
        # Edad (izquierda)
        left_col = tk.Frame(row1, bg=COLORS["bg_primary"])
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 8))
        
        tk.Label(
            left_col,
            text="Edad",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        entry_age = tk.Entry(
            left_col,
            font=("Segoe UI", 10),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            insertbackground=COLORS["accent"],
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        entry_age.pack(fill="x")
        if initial_data:
            entry_age.insert(0, str(initial_data.get("age", 20)))
        else:
            entry_age.insert(0, "20")
        
        # Fecha de Nacimiento (derecha)
        right_col = tk.Frame(row1, bg=COLORS["bg_primary"])
        right_col.pack(side="right", fill="both", expand=True)
        
        tk.Label(
            right_col,
            text="F. Nacimiento (DD/MM/AAAA)",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        entry_birth_var = tk.StringVar()
        entry_birth = tk.Entry(
            right_col,
            textvariable=entry_birth_var,
            font=("Segoe UI", 10),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            insertbackground=COLORS["accent"],
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        entry_birth.pack(fill="x")
        if initial_data and initial_data.get("birth_date"):
            entry_birth_var.set(initial_data["birth_date"])
        
        def on_birth_change(*args):
            current = entry_birth_var.get()
            formatted = format_date_input(current)
            if formatted != current:
                entry_birth_var.set(formatted)
        
        entry_birth_var.trace("w", on_birth_change)
        
        # Peso y Altura (lado a lado)
        row2 = tk.Frame(content, bg=COLORS["bg_primary"])
        row2.pack(fill="x", pady=(0, 16))
        
        # Peso (izquierda)
        left_col2 = tk.Frame(row2, bg=COLORS["bg_primary"])
        left_col2.pack(side="left", fill="both", expand=True, padx=(0, 8))
        
        tk.Label(
            left_col2,
            text="Peso (kg)",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        entry_weight = tk.Entry(
            left_col2,
            font=("Segoe UI", 10),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            insertbackground=COLORS["accent"],
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        entry_weight.pack(fill="x")
        if initial_data and initial_data.get("weight"):
            entry_weight.insert(0, initial_data["weight"])
        
        # Altura (derecha)
        right_col2 = tk.Frame(row2, bg=COLORS["bg_primary"])
        right_col2.pack(side="right", fill="both", expand=True)
        
        tk.Label(
            right_col2,
            text="Altura (cm)",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        entry_height = tk.Entry(
            right_col2,
            font=("Segoe UI", 10),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            insertbackground=COLORS["accent"],
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        entry_height.pack(fill="x")
        if initial_data and initial_data.get("height"):
            entry_height.insert(0, initial_data["height"])
        
        # Sexo (radio buttons)
        tk.Label(
            content,
            text="Sexo",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 8))
        
        sex_var = tk.StringVar(value=initial_data.get("sex", "X") if initial_data else "X")
        
        sex_frame = tk.Frame(content, bg=COLORS["bg_primary"])
        sex_frame.pack(anchor="w", pady=(0, 20))
        
        for sex in ["M", "F", "X"]:
            rb = tk.Radiobutton(
                sex_frame,
                text=sex,
                variable=sex_var,
                value=sex,
                font=("Segoe UI", 10),
                fg=COLORS["text_primary"],
                bg=COLORS["bg_primary"],
                selectcolor=COLORS["accent"],
                activebackground=COLORS["bg_primary"],
                activeforeground=COLORS["accent"]
            )
            rb.pack(side="left", padx=(0, 16))
        
        # Botones
        btn_frame = tk.Frame(content, bg=COLORS["bg_primary"])
        btn_frame.pack(fill="x", side="bottom")
        
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
            age_str = entry_age.get().strip()
            sex = sex_var.get()
            birth_date = entry_birth_var.get().strip() or None
            weight = entry_weight.get().strip() or None
            height = entry_height.get().strip() or None
            
            if not name:
                messagebox.showerror("Error", "El nombre es requerido")
                return
            
            try:
                age = int(age_str)
                if age < 0 or age > 120:
                    raise ValueError()
            except:
                messagebox.showerror("Error", "Edad inválida (0-120)")
                return
            
            if is_new:
                new_id = str(uuid.uuid4())
                ts = now_iso()
                self.conn.execute(
                    "INSERT INTO athletes (id, name, age, sex, avatar_seed, birth_date, weight, height, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (new_id, name, age, sex, new_id, birth_date, weight, height, ts, ts)
                )
            else:
                ts = now_iso()
                self.conn.execute(
                    "UPDATE athletes SET name=?, age=?, sex=?, birth_date=?, weight=?, height=?, updated_at=? WHERE id=?",
                    (name, age, sex, birth_date, weight, height, ts, athlete_id)
                )
            
            self.conn.commit()
            messagebox.showinfo("Éxito", "Atleta guardado ✅")
            win.destroy()
            self.reload()
        
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
    
    def on_double_click(self, event):
        """Evento de doble click en tabla"""
        selection = self.tree.selection()
        if selection:
            item_id = selection[0]
            cur = self.conn.execute(
                "SELECT name, age, sex, birth_date, height, weight FROM athletes WHERE id=?",
                (item_id,)
            )
            row = cur.fetchone()
            if row:
                initial_data = {
                    "name": row[0],
                    "age": row[1],
                    "sex": row[2],
                    "birth_date": row[3] or "",
                    "height": row[4] or "",
                    "weight": row[5] or ""
                }
                
                win = tk.Toplevel(self.master)
                win.title("Editar Atleta")
                win.geometry("550x480")
                win.resizable(False, False)
                win.configure(bg=COLORS["bg_primary"])
                
                self.create_athlete_form(win, is_new=False, athlete_id=item_id, initial_data=initial_data)
    
    def on_delete(self, event):
        """Elimina atleta seleccionado"""
        selection = self.tree.selection()
        if selection:
            item_id = selection[0]
            cur = self.conn.execute("SELECT name FROM athletes WHERE id=?", (item_id,))
            row = cur.fetchone()
            if row:
                if messagebox.askyesno("Confirmar", f"¿Eliminar atleta '{row[0]}'?"):
                    self.conn.execute("DELETE FROM athletes WHERE id=?", (item_id,))
                    self.conn.commit()
                    self.reload()
