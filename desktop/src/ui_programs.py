import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
import uuid

from .db import connect
from .schema import SCHEMA_SQL, migrate_database
from .theme import COLORS

def now_iso():
    return datetime.utcnow().isoformat()

DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

class ProgramsUI(ttk.Frame):
    def __init__(self, master):
        super().__init__(master)
        self.conn = connect()
        self.conn.executescript(SCHEMA_SQL)
        self.conn.commit()
        migrate_database(self.conn)
        
        self.current_program_id = None
        self.current_program_day_id = None
        
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
            text="📋 Programas",
            font=("Segoe UI", 24, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        title.pack(side="left")
        
        # Botón + Nuevo
        btn_new = tk.Button(
            header_content,
            text="+ Nuevo",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=16,
            pady=8,
            cursor="hand2",
            command=self.open_new_program
        )
        btn_new.pack(side="right")
        
        # ====== CONTENEDOR PRINCIPAL CON DOS PANELES ======
        main_paned = ttk.PanedWindow(self, orient="horizontal")
        main_paned.pack(fill="both", expand=True, padx=24, pady=24)
        
        # ====== PANEL IZQUIERDO: LISTA DE PROGRAMAS ======
        left_frame = tk.Frame(self, bg=COLORS["bg_primary"])
        main_paned.add(left_frame, weight=1)
        
        # Subtítulo
        lbl_programs = tk.Label(
            left_frame,
            text="Programas",
            font=("Segoe UI", 12, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        lbl_programs.pack(anchor="w", pady=(0, 12))
        
        # Scrollbar para programas
        scrollbar_left = ttk.Scrollbar(left_frame)
        scrollbar_left.pack(side="right", fill="y")
        
        self.tree_programs = ttk.Treeview(
            left_frame,
            columns=("athlete", "created"),
            show="tree headings",
            yscrollcommand=scrollbar_left.set,
            height=15
        )
        scrollbar_left.config(command=self.tree_programs.yview)
        
        self.tree_programs.heading("#0", text="🎯 Programa")
        self.tree_programs.heading("athlete", text="👥 Atleta")
        self.tree_programs.heading("created", text="📅 Fecha")
        
        self.tree_programs.column("#0", width=140)
        self.tree_programs.column("athlete", width=100)
        self.tree_programs.column("created", width=80)
        
        self.tree_programs.pack(fill="both", expand=True)
        
        self.tree_programs.bind("<Double-1>", self.on_program_double_click)
        self.tree_programs.bind("<Delete>", self.on_program_delete)
        
        # ====== PANEL DERECHO: DÍAS DEL PROGRAMA ======
        right_frame = tk.Frame(self, bg=COLORS["bg_primary"])
        main_paned.add(right_frame, weight=1)
        
        # Subtítulo
        lbl_days = tk.Label(
            right_frame,
            text="Días",
            font=("Segoe UI", 12, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        lbl_days.pack(anchor="w", pady=(0, 12))
        
        # Scrollbar para días
        scrollbar_right = ttk.Scrollbar(right_frame)
        scrollbar_right.pack(side="right", fill="y")
        
        self.tree_days = ttk.Treeview(
            right_frame,
            columns=("exercises"),
            show="tree headings",
            yscrollcommand=scrollbar_right.set,
            height=15
        )
        scrollbar_right.config(command=self.tree_days.yview)
        
        self.tree_days.heading("#0", text="📆 Día")
        self.tree_days.heading("exercises", text="💪 Ejercicios")
        
        self.tree_days.column("#0", width=140)
        self.tree_days.column("exercises", width=150)
        
        self.tree_days.pack(fill="both", expand=True)
        
        self.tree_days.bind("<Double-1>", self.on_day_double_click)
        self.tree_days.bind("<Delete>", self.on_day_delete)
    
    def reload(self):
        """Recarga la tabla de programas"""
        for item in self.tree_programs.get_children():
            self.tree_programs.delete(item)
        
        cur = self.conn.execute("""
            SELECT p.id, p.name, a.name as athlete, p.created_at
            FROM programs p
            LEFT JOIN athletes a ON p.athlete_id = a.id
            ORDER BY p.created_at DESC
        """)
        
        for row in cur.fetchall():
            _id = row[0]
            created_date = row[3][:10] if row[3] else ""
            self.tree_programs.insert("", "end", iid=_id, text=row[1], values=(row[2] or "Sin atleta", created_date))
    
    def reload_days(self):
        """Recarga los días del programa seleccionado"""
        for item in self.tree_days.get_children():
            self.tree_days.delete(item)
        
        if not self.current_program_id:
            return
        
        cur = self.conn.execute("""
            SELECT id, day_of_week, title FROM program_days
            WHERE program_id = ?
            ORDER BY day_of_week ASC
        """, (self.current_program_id,))
        
        for row in cur.fetchall():
            day_id = row[0]
            day_name = DAYS_OF_WEEK[row[1]] if row[1] < len(DAYS_OF_WEEK) else f"Día {row[1]}"
            
            # Contar ejercicios
            cur_items = self.conn.execute(
                "SELECT COUNT(*) FROM day_items WHERE program_day_id = ?",
                (day_id,)
            )
            count = cur_items.fetchone()[0]
            
            self.tree_days.insert("", "end", iid=day_id, text=f"{day_name} - {row[2]}", values=(f"{count} ejercicios",))
    
    def on_program_double_click(self, event):
        """Abre programa seleccionado"""
        selection = self.tree_programs.selection()
        if selection:
            self.current_program_id = selection[0]
            self.reload_days()
    
    def on_program_delete(self, event):
        """Elimina programa seleccionado"""
        selection = self.tree_programs.selection()
        if selection:
            program_id = selection[0]
            cur = self.conn.execute("SELECT name FROM programs WHERE id=?", (program_id,))
            row = cur.fetchone()
            if row:
                if messagebox.askyesno("Confirmar", f"¿Eliminar programa '{row[0]}'?"):
                    self.conn.execute("DELETE FROM program_days WHERE program_id=?", (program_id,))
                    self.conn.execute("DELETE FROM programs WHERE id=?", (program_id,))
                    self.conn.commit()
                    self.reload()
                    self.reload_days()
    
    def on_day_double_click(self, event):
        """Abre editor de día"""
        selection = self.tree_days.selection()
        if selection:
            day_id = selection[0]
            self.open_day_editor(day_id)
    
    def on_day_delete(self, event):
        """Elimina día del programa"""
        selection = self.tree_days.selection()
        if selection:
            day_id = selection[0]
            cur = self.conn.execute("SELECT title FROM program_days WHERE id=?", (day_id,))
            row = cur.fetchone()
            if row:
                if messagebox.askyesno("Confirmar", f"¿Eliminar '{row[0]}'?"):
                    self.conn.execute("DELETE FROM day_items WHERE program_day_id=?", (day_id,))
                    self.conn.execute("DELETE FROM program_days WHERE id=?", (day_id,))
                    self.conn.commit()
                    self.reload_days()
    
    def open_new_program(self):
        """Abre formulario para nuevo programa (Bootstrap style)"""
        win = tk.Toplevel(self.master)
        win.title("Nuevo Programa")
        win.geometry("550x450")
        win.resizable(False, False)
        win.configure(bg=COLORS["bg_primary"])
        
        # Header del modal
        header = tk.Frame(win, bg=COLORS["accent"], height=50)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_lbl = tk.Label(
            header,
            text="Nuevo Programa",
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
        
        # Atleta
        tk.Label(
            content,
            text="Atleta",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        cur = self.conn.execute("SELECT id, name FROM athletes ORDER BY name ASC")
        athletes = cur.fetchall()
        athlete_options = [f[1] for f in athletes]
        athlete_ids = [f[0] for f in athletes]
        
        athlete_var = tk.StringVar(value=athlete_options[0] if athlete_options else "")
        
        combo_style_frame = tk.Frame(content, bg=COLORS["bg_secondary"], highlightthickness=1, highlightbackground=COLORS["border"])
        combo_style_frame.pack(fill="x", pady=(0, 16))
        
        combo_athlete = ttk.Combobox(
            combo_style_frame,
            textvariable=athlete_var,
            values=athlete_options,
            state="readonly",
            font=("Segoe UI", 10)
        )
        combo_athlete.pack(fill="x", padx=0)
        
        # Notas
        tk.Label(
            content,
            text="Notas",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        ).pack(anchor="w", pady=(0, 6))
        
        text_notes = tk.Text(
            content,
            font=("Segoe UI", 9),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            insertbackground=COLORS["accent"],
            height=4,
            highlightthickness=1,
            highlightbackground=COLORS["border"],
            highlightcolor=COLORS["accent"]
        )
        text_notes.pack(fill="both", expand=True, pady=(0, 16))
        
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
            notes = text_notes.get("1.0", "end-1c").strip()
            athlete_name = athlete_var.get()
            
            if not name:
                messagebox.showerror("Error", "El nombre es requerido")
                return
            
            athlete_id = None
            if athlete_name and athlete_options:
                idx = athlete_options.index(athlete_name)
                athlete_id = athlete_ids[idx]
            
            new_id = str(uuid.uuid4())
            ts = now_iso()
            self.conn.execute(
                "INSERT INTO programs (id, athlete_id, name, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (new_id, athlete_id, name, notes or None, ts, ts)
            )
            self.conn.commit()
            messagebox.showinfo("Éxito", "Programa creado ✅")
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
    
    def open_day_editor(self, day_id):
        """Abre editor de día del programa (Bootstrap style)"""
        cur = self.conn.execute("SELECT title, day_of_week, program_id FROM program_days WHERE id=?", (day_id,))
        row = cur.fetchone()
        if not row:
            return
        
        title, day_of_week, program_id = row
        
        win = tk.Toplevel(self.master)
        win.title(f"Editar: {title}")
        win.geometry("700x500")
        win.resizable(True, True)
        win.configure(bg=COLORS["bg_primary"])
        
        # Header del modal
        header = tk.Frame(win, bg=COLORS["accent"], height=50)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_lbl = tk.Label(
            header,
            text=f"📆 {DAYS_OF_WEEK[day_of_week]} - {title}",
            font=("Segoe UI", 14, "bold"),
            fg="#000",
            bg=COLORS["accent"]
        )
        header_lbl.pack(fill="both", expand=True, padx=20)
        
        # Contenido
        frame = tk.Frame(win, bg=COLORS["bg_primary"])
        frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Tabla de ejercicios
        scrollbar = ttk.Scrollbar(frame)
        scrollbar.pack(side="right", fill="y")
        
        self.tree_items = ttk.Treeview(
            frame,
            columns=("exercise", "sets", "reps", "rest", "notes"),
            show="headings",
            yscrollcommand=scrollbar.set,
            height=12
        )
        scrollbar.config(command=self.tree_items.yview)
        
        self.tree_items.heading("exercise", text="💪 Ejercicio")
        self.tree_items.heading("sets", text="Series")
        self.tree_items.heading("reps", text="Reps")
        self.tree_items.heading("rest", text="Descanso")
        self.tree_items.heading("notes", text="Notas")
        
        self.tree_items.column("exercise", width=250)
        self.tree_items.column("sets", width=60, anchor="center")
        self.tree_items.column("reps", width=100, anchor="center")
        self.tree_items.column("rest", width=80, anchor="center")
        self.tree_items.column("notes", width=150)
        
        self.tree_items.pack(fill="both", expand=True, pady=(0, 12))
        
        # Cargar ejercicios del día
        cur_items = self.conn.execute("""
            SELECT di.id, e.name, di.sets, di.reps_min, di.reps_max, di.rest_seconds, di.notes
            FROM day_items di
            JOIN exercises e ON di.exercise_id = e.id
            WHERE di.program_day_id = ?
            ORDER BY di.order_index ASC
        """, (day_id,))
        
        for item_row in cur_items.fetchall():
            item_id, exercise, sets, reps_min, reps_max, rest, notes = item_row
            reps_text = f"{reps_min}-{reps_max}" if reps_max else str(reps_min)
            rest_text = f"{rest}s" if rest else ""
            self.tree_items.insert("", "end", iid=item_id, values=(exercise, sets, reps_text, rest_text, notes or ""))
        
        # Botones de acción
        btn_frame = tk.Frame(frame, bg=COLORS["bg_primary"])
        btn_frame.pack(fill="x", pady=(12, 0))
        
        def add_exercise():
            messagebox.showinfo("Info", "Función para agregar ejercicios - En desarrollo")
        
        btn_add = tk.Button(
            btn_frame,
            text="+ Ejercicio",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=12,
            pady=6,
            cursor="hand2",
            command=add_exercise
        )
        btn_add.pack(side="left", padx=(0, 4))
        
        btn_remove = tk.Button(
            btn_frame,
            text="🗑️ Eliminar",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=12,
            pady=6,
            cursor="hand2",
            command=lambda: self.remove_day_item(day_id)
        )
        btn_remove.pack(side="left")
        
        btn_close = tk.Button(
            btn_frame,
            text="Cerrar",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=12,
            pady=6,
            cursor="hand2",
            command=win.destroy,
            highlightthickness=1,
            highlightbackground=COLORS["border"]
        )
        btn_close.pack(side="right")
    
    def remove_day_item(self, day_id):
        """Elimina ejercicio seleccionado del día"""
        selection = self.tree_items.selection()
        if selection:
            item_id = selection[0]
            self.conn.execute("DELETE FROM day_items WHERE id=?", (item_id,))
            self.conn.commit()
            self.tree_items.delete(item_id)
