import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime
import shutil
import os
import sqlite3

from .db import connect, DB_PATH
from .schema import SCHEMA_SQL
from .theme import COLORS

class SettingsUI(ttk.Frame):
    def __init__(self, master):
        super().__init__(master)
        self.setup_ui()
    
    def setup_ui(self):
        """Configura la interfaz estilo Bootstrap"""
        # Frame principal con fondo
        main_bg = tk.Frame(self, bg=COLORS["bg_primary"])
        main_bg.pack(fill="both", expand=True)
        
        # ====== HEADER ======
        header = tk.Frame(main_bg, bg=COLORS["bg_primary"], height=80)
        header.pack(fill="x", padx=0, pady=0)
        header.pack_propagate(False)
        
        header_content = tk.Frame(header, bg=COLORS["bg_primary"])
        header_content.pack(fill="both", expand=True, padx=24, pady=16)
        
        # Título
        title = tk.Label(
            header_content,
            text="⚙️ Ajustes",
            font=("Segoe UI", 24, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_primary"]
        )
        title.pack(side="left")
        
        # ====== CONTENEDOR DE SECCIONES ======
        scroll_frame = tk.Frame(main_bg, bg=COLORS["bg_primary"])
        scroll_frame.pack(fill="both", expand=True, padx=24, pady=24)
        
        # Sección: Copia de Seguridad
        section_backup = tk.Frame(scroll_frame, bg=COLORS["bg_secondary"], highlightthickness=1, highlightbackground=COLORS["border"])
        section_backup.pack(fill="x", pady=(0, 16))
        
        # Header de sección
        section_header_backup = tk.Frame(section_backup, bg=COLORS["accent"], height=45)
        section_header_backup.pack(fill="x", padx=0, pady=0)
        section_header_backup.pack_propagate(False)
        
        tk.Label(
            section_header_backup,
            text="💾 Copia de Seguridad",
            font=("Segoe UI", 12, "bold"),
            fg="#000",
            bg=COLORS["accent"]
        ).pack(fill="both", expand=True, padx=16, pady=12)
        
        section_body_backup = tk.Frame(section_backup, bg=COLORS["bg_secondary"])
        section_body_backup.pack(fill="x", padx=16, pady=16)
        
        tk.Label(
            section_body_backup,
            text="Guardar y restaurar tu base de datos",
            font=("Segoe UI", 9),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"]
        ).pack(fill="x", pady=(0, 12))
        
        btn_frame_backup = tk.Frame(section_body_backup, bg=COLORS["bg_secondary"])
        btn_frame_backup.pack(fill="x")
        
        # Botones Bootstrap style
        btn_backup = tk.Button(
            btn_frame_backup,
            text="💾 Crear Copia",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=12,
            pady=8,
            cursor="hand2",
            command=self.create_backup
        )
        btn_backup.pack(side="left", padx=(0, 8))
        
        btn_restore = tk.Button(
            btn_frame_backup,
            text="↻ Restaurar",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=12,
            pady=8,
            cursor="hand2",
            command=self.restore_backup,
            highlightthickness=1,
            highlightbackground=COLORS["border"]
        )
        btn_restore.pack(side="left", padx=(0, 8))
        
        btn_open_backups = tk.Button(
            btn_frame_backup,
            text="📁 Abrir Carpeta",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=12,
            pady=8,
            cursor="hand2",
            command=self.open_backups_folder,
            highlightthickness=1,
            highlightbackground=COLORS["border"]
        )
        btn_open_backups.pack(side="left")
        
        # Sección: Base de Datos
        section_db = tk.Frame(scroll_frame, bg=COLORS["bg_secondary"], highlightthickness=1, highlightbackground=COLORS["border"])
        section_db.pack(fill="x", pady=(0, 16))
        
        # Header de sección
        section_header_db = tk.Frame(section_db, bg=COLORS["accent"], height=45)
        section_header_db.pack(fill="x", padx=0, pady=0)
        section_header_db.pack_propagate(False)
        
        tk.Label(
            section_header_db,
            text="🗂️ Base de Datos",
            font=("Segoe UI", 12, "bold"),
            fg="#000",
            bg=COLORS["accent"]
        ).pack(fill="both", expand=True, padx=16, pady=12)
        
        section_body_db = tk.Frame(section_db, bg=COLORS["bg_secondary"])
        section_body_db.pack(fill="x", padx=16, pady=16)
        
        tk.Label(
            section_body_db,
            text="Información de la base de datos",
            font=("Segoe UI", 9),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"]
        ).pack(fill="x", pady=(0, 12))
        
        # Info del archivo
        db_info_frame = tk.Frame(section_body_db, bg=COLORS["bg_secondary"])
        db_info_frame.pack(fill="x", pady=(0, 12))
        
        tk.Label(
            db_info_frame,
            text="📍 Ubicación:",
            font=("Segoe UI", 9, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"]
        ).pack(side="left")
        
        tk.Label(
            db_info_frame,
            text=DB_PATH,
            font=("Segoe UI", 9),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"]
        ).pack(side="left", padx=(8, 0))
        
        # Tamaño
        try:
            db_size = os.path.getsize(DB_PATH)
            size_mb = db_size / (1024 * 1024)
            size_text = f"⚖️ Tamaño: {size_mb:.2f} MB"
        except:
            size_text = "⚖️ Tamaño: No disponible"
        
        tk.Label(
            section_body_db,
            text=size_text,
            font=("Segoe UI", 9),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"]
        ).pack(fill="x", pady=(0, 12))
        
        btn_db_frame = tk.Frame(section_body_db, bg=COLORS["bg_secondary"])
        btn_db_frame.pack(fill="x")
        
        btn_optimize = tk.Button(
            btn_db_frame,
            text="✨ Optimizar",
            font=("Segoe UI", 10, "bold"),
            fg="#000",
            bg=COLORS["accent"],
            border=0,
            padx=12,
            pady=8,
            cursor="hand2",
            command=self.optimize_database
        )
        btn_optimize.pack(side="left", padx=(0, 8))
        
        btn_export = tk.Button(
            btn_db_frame,
            text="📊 Exportar SQL",
            font=("Segoe UI", 10, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"],
            border=0,
            padx=12,
            pady=8,
            cursor="hand2",
            command=self.export_sql,
            highlightthickness=1,
            highlightbackground=COLORS["border"]
        )
        btn_export.pack(side="left")
        
        # Sección: Información
        section_info = tk.Frame(scroll_frame, bg=COLORS["bg_secondary"], highlightthickness=1, highlightbackground=COLORS["border"])
        section_info.pack(fill="x")
        
        # Header de sección
        section_header_info = tk.Frame(section_info, bg=COLORS["accent"], height=45)
        section_header_info.pack(fill="x", padx=0, pady=0)
        section_header_info.pack_propagate(False)
        
        tk.Label(
            section_header_info,
            text="ℹ️ Información",
            font=("Segoe UI", 12, "bold"),
            fg="#000",
            bg=COLORS["accent"]
        ).pack(fill="both", expand=True, padx=16, pady=12)
        
        section_body_info = tk.Frame(section_info, bg=COLORS["bg_secondary"])
        section_body_info.pack(fill="x", padx=16, pady=16)
        
        tk.Label(
            section_body_info,
            text="Hexfit - Fitness Tracker v1.0",
            font=("Segoe UI", 11, "bold"),
            fg=COLORS["text_primary"],
            bg=COLORS["bg_secondary"]
        ).pack(fill="x", pady=(0, 8))
        
        tk.Label(
            section_body_info,
            text="Aplicación de escritorio para gestión de programas de ejercicio.",
            font=("Segoe UI", 9),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"]
        ).pack(fill="x", pady=(0, 4))
        
        tk.Label(
            section_body_info,
            text="© 2024 - Todos los derechos reservados",
            font=("Segoe UI", 8, "italic"),
            fg=COLORS["text_secondary"],
            bg=COLORS["bg_secondary"]
        ).pack(fill="x")
    
    def create_backup(self):
        """Crea una copia de seguridad de la base de datos"""
        try:
            backups_dir = os.path.expanduser("~/.rutinas_offline/backups")
            os.makedirs(backups_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(backups_dir, f"backup_{timestamp}.db")
            
            shutil.copy(DB_PATH, backup_path)
            
            messagebox.showinfo("Éxito", f"Copia creada ✅\n{backup_path}")
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo crear la copia:\n{str(e)}")
    
    def restore_backup(self):
        """Restaura una copia de seguridad"""
        try:
            backups_dir = os.path.expanduser("~/.rutinas_offline/backups")
            
            if not os.path.exists(backups_dir):
                messagebox.showerror("Error", "No hay copias de seguridad disponibles")
                return
            
            backup_file = filedialog.askopenfilename(
                initialdir=backups_dir,
                filetypes=[("Base de datos", "*.db"), ("Todos", "*.*")],
                title="Seleccionar copia a restaurar"
            )
            
            if backup_file:
                if messagebox.askyesno("Confirmar", "Esto sobrescribirá la base de datos actual. ¿Continuar?"):
                    shutil.copy(backup_file, DB_PATH)
                    messagebox.showinfo("Éxito", "Base de datos restaurada ✅\nPor favor, reinicia la aplicación.")
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo restaurar:\n{str(e)}")
    
    def open_backups_folder(self):
        """Abre la carpeta de copias de seguridad"""
        try:
            backups_dir = os.path.expanduser("~/.rutinas_offline/backups")
            os.makedirs(backups_dir, exist_ok=True)
            
            # Abrir carpeta con el explorador del sistema
            import subprocess
            if os.name == 'nt':  # Windows
                os.startfile(backups_dir)
            elif os.name == 'posix':  # macOS y Linux
                subprocess.Popen(['open', backups_dir])
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo abrir la carpeta:\n{str(e)}")
    
    def optimize_database(self):
        """Optimiza la base de datos"""
        try:
            conn = connect()
            conn.execute("VACUUM")
            conn.close()
            messagebox.showinfo("Éxito", "Base de datos optimizada ✅")
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo optimizar:\n{str(e)}")
    
    def export_sql(self):
        """Exporta la base de datos como SQL"""
        try:
            export_file = filedialog.asksaveasfilename(
                defaultextension=".sql",
                filetypes=[("SQL", "*.sql"), ("Todos", "*.*")],
                initialfile=f"hexfit_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
            )
            
            if export_file:
                conn = sqlite3.connect(DB_PATH)
                with open(export_file, 'w') as f:
                    for line in conn.iterdump():
                        f.write(f"{line}\n")
                conn.close()
                messagebox.showinfo("Éxito", f"Exportado ✅\n{export_file}")
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo exportar:\n{str(e)}")

