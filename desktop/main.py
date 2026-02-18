import tkinter as tk
from tkinter import ttk
from src.theme import configure_styles, COLORS
from src.ui_athletes import AthletesUI
from src.ui_exercises import ExercisesUI
from src.ui_programs import ProgramsUI
from src.ui_settings import SettingsUI

def main():
    root = tk.Tk()
    root.title("💪 Hexfit - Fitness Tracker")
    root.geometry("1200x700")
    root.minsize(1000, 600)
    
    # Configurar tema
    style = ttk.Style()
    try:
        style.theme_use("clam")
    except:
        pass
    
    configure_styles()
    
    # Color de fondo principal
    root.configure(bg=COLORS["bg_primary"])
    
    # Notebook (tabs) con estilo Bootstrap
    notebook = ttk.Notebook(root)
    notebook.pack(fill="both", expand=True, padx=0, pady=0)
    
    # Tab 1: Atletas
    frame_athletes = ttk.Frame(notebook, style="TFrame")
    frame_athletes.configure(style="TFrame")
    notebook.add(frame_athletes, text="👥 Atletas")
    athletes_ui = AthletesUI(frame_athletes)
    athletes_ui.pack(fill="both", expand=True)
    
    # Tab 2: Ejercicios
    frame_exercises = ttk.Frame(notebook, style="TFrame")
    frame_exercises.configure(style="TFrame")
    notebook.add(frame_exercises, text="💪 Ejercicios")
    exercises_ui = ExercisesUI(frame_exercises)
    exercises_ui.pack(fill="both", expand=True)
    
    # Tab 3: Programas
    frame_programs = ttk.Frame(notebook, style="TFrame")
    frame_programs.configure(style="TFrame")
    notebook.add(frame_programs, text="📋 Programas")
    programs_ui = ProgramsUI(frame_programs)
    programs_ui.pack(fill="both", expand=True)
    
    # Tab 4: Ajustes
    frame_settings = ttk.Frame(notebook, style="TFrame")
    frame_settings.configure(style="TFrame")
    notebook.add(frame_settings, text="⚙️ Ajustes")
    settings_ui = SettingsUI(frame_settings)
    settings_ui.pack(fill="both", expand=True)
    
    root.mainloop()

if __name__ == "__main__":
    main()