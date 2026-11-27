import docx, glob, os, re, json, datetime

FOLDER = r"C:\Users\armaa\Downloads\DATA LIST\DATA LIST"
OUT = r"C:\Users\armaa\kids-island\scripts\students.json"


def clean(s):
    if s is None:
        return ""
    s = str(s)
    s = s.replace("\u2019", "'").replace("\u2018", "'").replace("\ufffd", "'")
    s = s.replace("\u2013", "-").replace("\u2014", "-").replace("\xa0", " ")
    s = re.sub(r"[\r\n\t]+", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def norm_header(s):
    return re.sub(r"[^a-z0-9]", "", clean(s).lower())


def parse_filename(path):
    base = os.path.basename(path)
    m = re.search(r"CLASS\s+(PG|LKG|UKG|\d+)\s*[- ]?\s*([AB])?", base, re.I)
    if not m:
        raise ValueError(f"cannot parse class from {base}")
    cls = m.group(1).upper()
    sec = (m.group(2) or "").upper()
    if cls == "PG":
        cls = "Play Group"
    return cls, sec


def class_order(cls):
    if cls == "Play Group":
        return 0
    if cls == "LKG":
        return 1
    if cls == "UKG":
        return 2
    try:
        # Class 1 → 3, Class 12 → 14, so pre-primary always sorts first
        return int(cls) + 2
    except ValueError:
        return 99


def parse_date(s):
    s = clean(s)
    if not s:
        return None
    s = s.replace(".", "/").replace("-", "/")
    parts = [p for p in s.split("/") if p.strip()]
    if len(parts) != 3:
        return None
    try:
        d, mo, y = (int(p) for p in parts)
    except ValueError:
        return None
    # Repair obvious 5-digit-year typos such as 20211 → 2011 and 20214 → 2014.
    if 10000 <= y <= 29999:
        ys = str(y)
        if ys.startswith("20") and len(ys) == 5:
            y = int(ys[:2] + ys[3:])
    if y < 100:
        y += 2000 if y < 50 else 1900
    try:
        return datetime.date(y, mo, d).isoformat()
    except ValueError:
        return None


def map_header(row):
    """Return dict of field -> column index based on a header row."""
    mapping = {}
    cells = [clean(c.text) for c in row.cells]
    for i, raw in enumerate(cells):
        h = norm_header(raw)
        if not h:
            continue
        if h in ("sno", "sno.", "sno") or h.startswith("sno") or h == "s":
            mapping.setdefault("serial_no", i)
        elif h in ("name", "mame", "studentname", "studentsname"):
            mapping.setdefault("name", i)
        elif "caste" in h:
            mapping.setdefault("caste", i)
        elif "adm" in h and "no" in h:
            mapping.setdefault("admission_number", i)
        elif h in ("mf", "mf.", "mfno"):
            mapping.setdefault("gender", i)
        elif "dob" in h or "dateofbirth" in h:
            mapping.setdefault("date_of_birth", i)
        elif "father" in h:
            mapping.setdefault("father_name", i)
        elif "mother" in h:
            mapping.setdefault("mother_name", i)
        elif "address" in h:
            mapping.setdefault("address", i)
        elif "alternate" in h or "alt" in h or "altrnate" in h:
            mapping.setdefault("alternate_phone", i)
        elif "mob" in h or h in ("phone", "phoneno", "mobile", "contact"):
            mapping.setdefault("phone", i)
        elif "aadhar" in h or "aadhaar" in h:
            mapping.setdefault("aadhaar_number", i)
        elif "apaar" in h:
            mapping.setdefault("apaar_id", i)
        elif "pen" in h:
            mapping.setdefault("pen_number", i)
        elif "remark" in h or "tcissue" in h:
            mapping.setdefault("remark", i)
        elif "pcb" in h or "pcm" in h:
            mapping.setdefault("stream", i)
    return mapping


def is_header_row(row):
    cells = [norm_header(c.text) for c in row.cells]
    joined = " ".join(cells)
    has_name = any(c in ("name", "mame") for c in cells)
    has_sno = any(c.startswith("sno") or c in ("sno", "s") for c in cells)
    return has_name or (has_sno and "adm" in joined)


def extract(path):
    d = docx.Document(path)
    cls, section = parse_filename(path)
    paras = [clean(p.text) for p in d.paragraphs if p.text.strip()]
    header_text = " | ".join(paras)
    # stated student count
    stated = None
    m = re.search(r"STUDENTS?\s*[-:]?\s*(\d+)", header_text, re.I)
    if m:
        stated = int(m.group(1))
    # class teacher
    teacher = None
    m = re.search(r"CLASS\s*TEACHER\s*[:.-]?\s*(.+)$", header_text, re.I)
    if m:
        teacher = clean(m.group(1))
    if not teacher:
        # teacher usually on the 3rd line next to year
        for p in paras:
            if re.match(r"^20\d\d\s*[-/]\s*20\d\d", p):
                rest = re.sub(r"^20\d\d\s*[-/]\s*20\d\d", "", p).strip(" -|\t")
                if rest:
                    teacher = clean(rest)
                break

    rows = []
    mapping = None
    for table in d.tables:
        if len(table.columns) < 5:
            continue
        header_row = table.rows[0]
        if is_header_row(header_row) or mapping is None:
            mapping = map_header(header_row)
            data_rows = table.rows[1:]
        else:
            data_rows = table.rows
        if "name" not in mapping:
            # fallback: name is the 2nd column
            mapping["name"] = 1
        for r in data_rows:
            cells = [clean(c.text) for c in r.cells]

            def get(field):
                idx = mapping.get(field)
                if idx is None or idx >= len(cells):
                    return ""
                return cells[idx]

            name = get("name")
            if not name:
                continue
            if norm_header(name) in ("name", "mame", "total", "grandtotal"):
                continue
            if re.search(r"\btotal\b", name, re.I):
                continue
            adm = get("admission_number")
            if not adm and not get("father_name"):
                # likely junk/footer row
                continue
            gender_raw = get("gender").upper()
            gender = None
            if gender_raw.startswith("M"):
                gender = "Male"
            elif gender_raw.startswith("F"):
                gender = "Female"
            dob_raw = get("date_of_birth") or None
            dob = parse_date(dob_raw)
            remark = get("remark") or None
            if dob_raw and not dob:
                note = f"DOB needs verification (source: {dob_raw})"
                remark = f"{remark} | {note}" if remark else note
            rows.append({
                "serial_no": get("serial_no") or None,
                "name": name,
                "admission_number": adm or None,
                "gender": gender,
                "date_of_birth": dob,
                "date_of_birth_raw": dob_raw,
                "father_name": get("father_name") or None,
                "mother_name": get("mother_name") or None,
                "address": get("address") or None,
                "phone": re.sub(r"[^\d+]", "", get("phone")) or None,
                "alternate_phone": re.sub(r"[^\d+]", "", get("alternate_phone")) or None,
                "aadhaar_number": get("aadhaar_number") or None,
                "apaar_id": get("apaar_id") or None,
                "pen_number": get("pen_number") or None,
                "remark": remark,
                "caste": get("caste") or None,
                "stream": get("stream") or None,
                "class": cls,
                "section": section,
                "class_order": class_order(cls),
                "class_teacher": teacher,
                "source_file": os.path.basename(path),
            })
    return {
        "file": os.path.basename(path),
        "class": cls,
        "section": section,
        "stated": stated,
        "teacher": teacher,
        "rows": rows,
    }


def main():
    files = sorted(glob.glob(os.path.join(FOLDER, "*.docx")))
    all_rows = []
    report = []
    for f in files:
        res = extract(f)
        # dedupe inside class by name+adm
        seen = set()
        uniq = []
        dups = 0
        for r in res["rows"]:
            key = (r["name"].lower(), (r["admission_number"] or "").lower())
            if key in seen:
                dups += 1
                continue
            seen.add(key)
            uniq.append(r)
        res["rows"] = uniq
        all_rows.extend(uniq)
        report.append({
            "file": res["file"],
            "class": res["class"],
            "section": res["section"],
            "teacher": res["teacher"],
            "stated": res["stated"],
            "extracted": len(uniq),
            "raw": len(uniq) + dups,
            "dupes_removed": dups,
        })

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(all_rows, fh, ensure_ascii=False, indent=1)

    print(f"Wrote {len(all_rows)} students to {OUT}\n")
    print(f"{'file':32} {'cls':11} {'sec':3} {'stated':>6} {'extr':>5} {'dups':>4}")
    print("-" * 70)
    for r in report:
        print(f"{r['file']:32} {r['class']:11} {r['section']:3} {str(r['stated']):>6} {r['extracted']:>5} {r['dupes_removed']:>4}")

    # anomaly checks
    print("\n--- anomalies ---")
    missing_adm = [r for r in all_rows if not r["admission_number"]]
    print("missing admission number:", len(missing_adm))
    for r in missing_adm[:20]:
        print("   ", r["class"], r["section"], r["name"], r["father_name"])
    missing_dob = [r for r in all_rows if not r["date_of_birth"]]
    print("missing/invalid dob:", len(missing_dob))
    for r in missing_dob[:20]:
        print("   ", r["class"], r["section"], r["name"], repr(r["date_of_birth_raw"]))
    # duplicate admission numbers across all
    from collections import Counter
    adm_counts = Counter(r["admission_number"] for r in all_rows if r["admission_number"])
    dups = {k: v for k, v in adm_counts.items() if v > 1}
    print("duplicate admission numbers:", len(dups))
    for k, v in list(dups.items())[:20]:
        names = [f'{r["class"]}-{r["section"]}:{r["name"]}' for r in all_rows if r["admission_number"] == k]
        print("   ", k, v, names)
    # gender coverage
    print("gender set:", sum(1 for r in all_rows if r["gender"]), "/", len(all_rows))


if __name__ == "__main__":
    main()
