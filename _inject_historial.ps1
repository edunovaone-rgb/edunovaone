# Inyecta meta-tags de historial y script registrar-visita.js en cada tema-*.html y libro-*.html
$dir = "c:\Users\Casa\Desktop\J.A.P\workspace\proyecto"

# Mapa: nombre-archivo -> (titulo, materia, grado, icono)
$meta = @{
  "tema-arte-3"         = @("Arte y Cultura", "arte",         "3° Secundaria", "🎨")
  "tema-arte-4"         = @("Arte y Cultura", "arte",         "4° Secundaria", "🎨")
  "tema-ciencias-1"     = @("Ciencia y Tecnología", "ciencia","1° Secundaria", "🔬")
  "tema-ciencias-2"     = @("Ciencia y Tecnología", "ciencia","2° Secundaria", "🧬")
  "tema-ciencias-3"     = @("Ciencia y Tecnología", "ciencia","3° Secundaria", "⚗️")
  "tema-ciencias-4"     = @("Ciencia y Tecnología", "ciencia","4° Secundaria", "🧬")
  "tema-ciencias-5"     = @("Ciencia y Tecnología", "ciencia","5° Secundaria", "🔬")
  "tema-comunicacion-1" = @("Comunicación", "comunicacion",   "1° Secundaria", "📖")
  "tema-comunicacion-2" = @("Comunicación", "comunicacion",   "2° Secundaria", "📖")
  "tema-comunicacion-3" = @("Comunicación", "comunicacion",   "3° Secundaria", "📖")
  "tema-comunicacion-4" = @("Comunicación", "comunicacion",   "4° Secundaria", "📖")
  "tema-comunicacion-5" = @("Comunicación", "comunicacion",   "5° Secundaria", "📖")
  "tema-filosofia-5"    = @("Filosofía / PFRH", "filosofia",  "5° Secundaria", "🧠")
  "tema-historia-1"     = @("Historia, Geografía y Economía","historia","1° Secundaria","🏛️")
  "tema-historia-2"     = @("Historia, Geografía y Economía","historia","2° Secundaria","🌍")
  "tema-historia-3"     = @("Historia, Geografía y Economía","historia","3° Secundaria","🏛️")
  "tema-historia-4"     = @("Historia, Geografía y Economía","historia","4° Secundaria","🌍")
  "tema-historia-5"     = @("Historia, Geografía y Economía","historia","5° Secundaria","🇵🇪")
  "tema-ingles-1"       = @("Inglés", "ingles",               "1° Secundaria", "🇬🇧")
  "tema-ingles-2"       = @("Inglés", "ingles",               "2° Secundaria", "🇬🇧")
  "tema-ingles-3"       = @("Inglés", "ingles",               "3° Secundaria", "🇬🇧")
  "tema-ingles-4"       = @("Inglés", "ingles",               "4° Secundaria", "🇬🇧")
  "tema-ingles-5"       = @("Inglés", "ingles",               "5° Secundaria", "🇬🇧")
  "tema-matematica-2"   = @("Matemática", "matematica",       "2° Secundaria", "📐")
  "tema-matematica-3"   = @("Matemática", "matematica",       "3° Secundaria", "📐")
  "tema-matematica-4"   = @("Matemática", "matematica",       "4° Secundaria", "📐")
  "tema-matematica-5"   = @("Matemática", "matematica",       "5° Secundaria", "📐")
  "tema-trabajo-1"      = @("Educación para el Trabajo","tecnologia","1° Secundaria","💻")
  "libro-aritmetica-1"  = @("Aritmética Básica","matematica", "1° Secundaria", "📐")
}

$registrarScript = '<script type="module">
import { registrarVisita } from "./historial.js";
(function(){
  const m=n=>{const e=document.querySelector(`meta[name="${n}"]`);return e?e.getAttribute("content"):"";};
  const titulo=m("enu:titulo")||document.title.split("|")[0].trim();
  const materia=m("enu:materia");const grado=m("enu:grado");const icono=m("enu:icono")||"📄";
  const id=location.pathname.replace(/\.html$/,"").split("/").pop();
  if(titulo)registrarVisita({id,titulo,materia,grado,icono});
})();
</script>'

$count = 0
foreach ($key in $meta.Keys) {
  $file = Join-Path $dir "$key.html"
  if (-not (Test-Path $file)) { Write-Host "SKIP (no existe): $key.html"; continue }

  $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

  # Saltar si ya tiene enu:titulo
  if ($content -contains 'enu:titulo') { Write-Host "SKIP (ya tiene meta): $key.html"; continue }
  if ($content -match 'enu:titulo') { Write-Host "SKIP (ya tiene meta): $key.html"; continue }

  $titulo  = $meta[$key][0]
  $materia = $meta[$key][1]
  $grado   = $meta[$key][2]
  $icono   = $meta[$key][3]

  $metaTags = @"

  <meta name="enu:titulo"  content="$titulo" />
  <meta name="enu:materia" content="$materia" />
  <meta name="enu:grado"   content="$grado" />
  <meta name="enu:icono"   content="$icono" />
"@

  # Insertar meta-tags justo antes de </head>
  $newContent = $content -replace '(</head>)', "$metaTags`$1"

  # Insertar script de registro justo antes de </body>
  $newContent = $newContent -replace '(</body>)', "$registrarScript`$1"

  [System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
  $count++
  Write-Host "OK: $key.html"
}

Write-Host "`n✅ $count archivos actualizados."
