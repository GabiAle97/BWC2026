parameters = [
 "Jugador",
 "Time",
 "Basement",
 "RPD Locker",
 "Dogs/Zombies",
 "Book",
 "Batery",
 "Pharmacy",
 "Train Crash",
 "Powders",
 "Music Box",
 "Yolo Carlos",
 "Carlos's Zombies",
 "GraveDigger",
 "Water Puzzle",
 "Acid Nemmy",
 "Wolf Line",
 "Supergamer",
 "Final Nemmy",
 "CAUTION",
 "DANGER",
 "POISON"
]

# si el input es A o a, se va a escribir el archivo "matches/1 - A", caso contrario (B o b) a "matches/1 - B", ambos están vacíos
# el siguiente input sera un numero del 1 al 22 (correspondiente al numero de linea a escribir) 
# el siguiente input es el valor que se escribira en el archivo, exactamente en la linea correspondiente
read = input("Ingrese la letra (A o B): ")
index = 3
value = input("Ingrese el nombre: ")
cautions = 0
dangers = 0
poisons = 0

file_name = f"matches/1 - {read.upper()}"

def write_line(path, line_number, text):
    with open(path, "r", encoding="utf-8") as file:
        lines = file.readlines()

    while len(lines) < line_number:
        lines.append("\n")

    lines[line_number - 1] = text + "\n"

    with open(path, "w", encoding="utf-8") as file:
        file.writelines(lines)

write_line(file_name, 1, value)
while index != 1:
    value = input(f"Ingrese el valor para {parameters[index-1]}: ")
    if value == "C" or value == "c":
        cautions += 1
    elif value == "D" or value == "d":
        dangers += 1
    elif value == "P" or value == "p":
        poisons += 1
    write_line(file_name, index, value)
    if index == 6:
        
    if index == 2:
        write_line(file_name, 20, str(cautions))
        write_line(file_name, 21, str(dangers))
        write_line(file_name, 22, str(poisons))
        index = 1
    elif index == 19:
        index = 2
    else:
        if value != "C" and value != "c" and value != "D" and value != "d" and value != "P" and value != "p":
            index += 1