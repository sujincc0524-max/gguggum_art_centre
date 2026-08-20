/* Admin editing system for gguggum art centre.

   Client-side only — this is a static site with no server, so this is a
   password *deterrent* for casual visitors, not real security (anyone who
   opens the page source can read PASSWORD below). Don't use it to gate
   anything sensitive.

   How it works:
   - "관리자" button (bottom-right on every page) asks for PASSWORD, then
     unlocks edit buttons (pencil icons) on every card/photo/bio/etc.
   - Edits are kept in this browser's localStorage so they survive reloads,
     but only in this browser — they are NOT visible to other visitors or
     other devices, and are NOT what the live site actually serves.
   - "내보내기" downloads updated data.js / artists.js / publications.js /
     news.js / contact.js (plus any newly uploaded images) so whoever
     deploys the site can drop them into the js/ and img/ folders and
     re-publish. That hand-off step is manual by design — there's no
     backend here to do it automatically.

   To change the password, edit the PASSWORD constant just below. */

(function () {
  var PASSWORD = "gguggum2026";

  var STORAGE_PREFIX = "gg_admin_data__";
  var SESSION_KEY = "gg_admin_unlocked";

  var GLOBALS = ["ggExhibitions", "ggArtists", "ggPublications", "ggNews", "ggContact"];

  var FILE_NAMES = {
    ggExhibitions: "data.js",
    ggArtists: "artists.js",
    ggPublications: "publications.js",
    ggNews: "news.js",
    ggContact: "contact.js"
  };

  var SCHEMAS = {
    ggExhibitions: {
      label: "전시",
      list: true,
      fields: [
        { key: "titleKo", label: "제목 (한글)", type: "text" },
        { key: "titleEn", label: "제목 (영문, 선택)", type: "text" },
        { key: "category", label: "구분", type: "select", options: [
          { value: "ongoing", label: "진행중 (ONGOING)" },
          { value: "past", label: "지난 전시 (PAST)" },
          { value: "collab", label: "콜라보레이션 (COLLAB)" }
        ] },
        { key: "dateLabel", label: "날짜 (목록에 표시)", type: "text" },
        { key: "subLabel", label: "부제 (선택)", type: "text" },
        { key: "image", label: "포스터 이미지", type: "image", filePrefix: "poster" },
        { key: "detail.sub", label: "상세페이지 부제", type: "text" },
        { key: "detail.date", label: "상세페이지 날짜", type: "text" },
        { key: "detail.body", label: "상세 설명", type: "textarea" }
      ],
      makeNew: function (id) {
        return {
          id: id,
          category: "past",
          titleKo: "",
          titleEn: "",
          dateLabel: "",
          subLabel: "",
          image: "",
          href: "exhibition-detail.html?id=" + id,
          detail: { sub: "", date: "", body: "" }
        };
      }
    },
    ggArtists: {
      label: "아티스트",
      list: true,
      reorder: true,
      fields: [
        { key: "name", label: "이름", type: "text" },
        { key: "photo", label: "사진", type: "image", filePrefix: "artist" },
        { key: "bio", label: "소개글 (빈 줄로 문단 구분)", type: "paragraphs" }
      ],
      makeNew: function (id) {
        return { id: id, name: "", photo: "", bio: [] };
      },
      insertBefore: function (item) {
        return !item.id;
      }
    },
    ggPublications: {
      label: "출판물",
      list: true,
      fields: [
        { key: "title", label: "제목", type: "text" },
        { key: "publisher", label: "출판사", type: "text" },
        { key: "size", label: "사이즈", type: "text" },
        { key: "pages", label: "페이지 수", type: "text" },
        { key: "year", label: "연도", type: "text" },
        { key: "price", label: "가격", type: "text" },
        { key: "cover", label: "표지 이미지", type: "image", filePrefix: "pub" },
        { key: "link", label: "구매 링크", type: "text" }
      ],
      makeNew: function (id) {
        return { id: id, title: "", publisher: "", size: "", pages: "", year: "", price: "", cover: "", link: "" };
      }
    },
    ggNews: {
      label: "뉴스",
      list: true,
      fields: [
        { key: "title", label: "제목", type: "text" },
        { key: "category", label: "구분", type: "select", options: [
          { value: "film", label: "Film" },
          { value: "article", label: "Article" },
          { value: "journal", label: "Journal" }
        ] },
        { key: "date", label: "날짜 (정렬 기준, YYYY-MM-DD)", type: "text" },
        { key: "dateLabel", label: "날짜 표시", type: "text" },
        { key: "banner", label: "대표 이미지", type: "image", filePrefix: "news" },
        { key: "link", label: "원문 링크", type: "text" },
        { key: "body", label: "본문 (빈 줄로 문단 구분)", type: "paragraphs" }
      ],
      makeNew: function (id) {
        var today = new Date().toISOString().slice(0, 10);
        return { id: id, category: "film", title: "", date: today, dateLabel: today, banner: "", link: "", body: [] };
      }
    },
    ggContact: {
      label: "연락처",
      list: false,
      fields: [
        { key: "address", label: "주소 (줄바꿈으로 구분)", type: "lines" },
        { key: "tel", label: "전화번호", type: "text" },
        { key: "email", label: "이메일", type: "text" },
        { key: "hours", label: "운영시간 (줄바꿈으로 구분)", type: "lines" },
        { key: "photo", label: "건물 사진", type: "image", filePrefix: "contact" },
        { key: "introKo", label: "소개글 (한글)", type: "textarea" },
        { key: "introEn", label: "소개글 (영문)", type: "textarea" }
      ]
    }
  };

  /* ---------- small helpers ---------- */
  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o == null ? o : o[k];
    }, obj);
  }

  function setPath(obj, path, value) {
    var parts = path.split(".");
    var last = parts.pop();
    var target = parts.reduce(function (o, k) {
      if (o[k] == null) o[k] = {};
      return o[k];
    }, obj);
    target[last] = value;
  }

  function slug(input) {
    var s = String(input)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return s || ("item-" + Date.now());
  }

  function uniqueId(globalName, base) {
    var arr = window[globalName] || [];
    var id = base;
    var i = 2;
    while (arr.some(function (it) { return it.id === id; })) {
      id = base + "-" + i;
      i++;
    }
    return id;
  }

  function extFromMime(mime) {
    if (!mime) return null;
    if (mime === "image/png") return "png";
    if (mime === "image/jpeg") return "jpg";
    if (mime === "image/webp") return "webp";
    if (mime === "image/gif") return "gif";
    return null;
  }

  function extFromDataUrl(dataUrl) {
    var m = /^data:image\/([a-zA-Z0-9+.-]+);/.exec(dataUrl || "");
    if (!m) return null;
    var t = m[1].toLowerCase();
    if (t === "jpeg") return "jpg";
    if (t === "svg+xml") return "svg";
    return t;
  }

  /* Uploaded photos get read + downscaled through a canvas before being
     stored as a data: URL. Two reasons: (1) phone-camera photos can be
     several MB each as base64, and localStorage caps out around 5-10MB —
     once a few full-size photos pile up, saves silently fail with a
     QuotaExceededError; downscaling keeps each photo small. (2) it also
     makes the resulting page load faster. GIF/SVG pass through untouched
     since re-encoding would drop animation/vector data; everything else is
     capped to MAX_IMAGE_DIM on its longest side and re-encoded as JPEG. */
  var MAX_IMAGE_DIM = 1600;
  var IMAGE_QUALITY = 0.85;

  function resizeImageFile(file) {
    return new Promise(function (resolve, reject) {
      if (/gif|svg/.test(file.type)) {
        var passReader = new FileReader();
        passReader.onerror = function () { reject(passReader.error || new Error("read failed")); };
        passReader.onload = function () {
          resolve({ dataUrl: passReader.result, mimeType: file.type });
        };
        passReader.readAsDataURL(file);
        return;
      }

      var reader = new FileReader();
      reader.onerror = function () { reject(reader.error || new Error("read failed")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () {
          // Not a decodable image (or canvas unsupported) — fall back to
          // the original, unresized data so the upload still goes through.
          resolve({ dataUrl: reader.result, mimeType: file.type });
        };
        img.onload = function () {
          try {
            var scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
            var w = Math.max(1, Math.round(img.width * scale));
            var h = Math.max(1, Math.round(img.height * scale));
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve({ dataUrl: reader.result, mimeType: file.type });
              return;
            }
            ctx.drawImage(img, 0, 0, w, h);
            var outType = file.type === "image/png" ? "image/png" : "image/jpeg";
            var dataUrl = canvas.toDataURL(outType, IMAGE_QUALITY);
            resolve({ dataUrl: dataUrl, mimeType: outType });
          } catch (e) {
            resolve({ dataUrl: reader.result, mimeType: file.type });
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- storage ---------- */
  function isUnlocked() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function loadSaved(globalName) {
    var raw = localStorage.getItem(STORAGE_PREFIX + globalName);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveCurrent(globalName) {
    var data = window[globalName];
    if (data == null) return true;
    try {
      localStorage.setItem(STORAGE_PREFIX + globalName, JSON.stringify(data));
      return true;
    } catch (e) {
      // Almost always a full localStorage quota (5-10MB per browser) —
      // most likely from accumulated photo uploads. The edit is still
      // visible on screen for this session (it already changed the
      // in-memory data), but it won't survive a reload until this is
      // resolved, so say so clearly instead of failing silently.
      window.alert(
        "저장에 실패했습니다. 브라우저 저장 공간이 가득 찬 것 같습니다 (사진을 여러 장 올리면 발생할 수 있어요).\n\n" +
        "지금 보이는 화면은 새로고침하면 사라집니다. 먼저 '내보내기'로 지금까지의 작업을 백업한 뒤, " +
        "필요 없는 사진이 있으면 정리해주세요."
      );
      return false;
    }
  }

  function applyOverrides() {
    GLOBALS.forEach(function (name) {
      var saved = loadSaved(name);
      if (saved != null) window[name] = saved;
    });
  }

  /* Rough usage indicator for the admin bar. Real per-browser localStorage
     caps vary (5-10MB), so this assumes the conservative low end — better
     to warn a bit early than to let someone get surprised by a failed
     save with no notice at all. */
  var ASSUMED_STORAGE_QUOTA = 5000000;

  function estimateStorageUsage() {
    var total = 0;
    GLOBALS.forEach(function (name) {
      var raw = localStorage.getItem(STORAGE_PREFIX + name);
      if (raw) total += raw.length;
    });
    return {
      total: total,
      pct: Math.min(100, Math.round((total / ASSUMED_STORAGE_QUOTA) * 100))
    };
  }

  /* This site is usually opened as a local file (file://), where browsers
     don't expose a normal "site settings" page to clear storage per-site
     the way they do for https:// pages. So instead of sending someone to
     dig through browser settings, this button clears exactly (and only)
     this admin system's own localStorage keys directly via JS — nothing
     else on the visitor's machine is touched. */
  function clearAllStorage() {
    var proceed = window.confirm(
      "저장공간을 비웁니다.\n\n" +
      "먼저 '내보내기'로 지금까지의 편집 내용을 반드시 백업했는지 확인해주세요.\n" +
      "비우면 브라우저에 저장된 모든 편집 내용이 사라지고, js/ 폴더의 원래 파일 내용으로 되돌아갑니다.\n" +
      "되돌릴 수 없습니다. 계속할까요?"
    );
    if (!proceed) return;
    GLOBALS.forEach(function (name) {
      localStorage.removeItem(STORAGE_PREFIX + name);
    });
    location.reload();
  }

  /* ---------- rerender registry ---------- */
  var rerenderCallbacks = [];
  var refreshToggleBar = null;

  function registerRerender(fn) {
    rerenderCallbacks.push(fn);
  }

  function triggerRerender() {
    rerenderCallbacks.forEach(function (fn) {
      fn();
    });
    if (isUnlocked()) {
      scanEditButtons();
      attachAddButtons();
    }
    if (refreshToggleBar) refreshToggleBar();
  }

  /* ---------- item lookup ---------- */
  function findItem(globalName, id) {
    var schema = SCHEMAS[globalName];
    if (!schema) return null;
    if (!schema.list) return window[globalName];
    var arr = window[globalName] || [];
    return arr.filter(function (it) {
      return it.id === id;
    })[0] || null;
  }

  /* ---------- reordering (list schemas with reorder: true) ---------- */
  function moveItem(globalName, id, direction) {
    var arr = window[globalName];
    if (!arr) return;
    var idx = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= arr.length) return;
    var tmp = arr[idx];
    arr[idx] = arr[newIdx];
    arr[newIdx] = tmp;
    saveCurrent(globalName);
    triggerRerender();
  }

  function applyFieldValues(item, schema, values) {
    schema.fields.forEach(function (field) {
      if (!(field.key in values)) return;
      var v = values[field.key];
      if (field.type === "image") {
        if (v && v.__upload) {
          var existing = getPath(item, field.key);
          item.__exportNames = item.__exportNames || {};
          var name = item.__exportNames[field.key];
          if (!name) {
            if (existing && /^img\//.test(existing)) {
              name = existing.replace(/^img\//, "");
            } else {
              var ext = extFromMime(v.mimeType) || "jpg";
              name = (field.filePrefix || "img") + "_" + (item.id || slug(Date.now())) + "." + ext;
            }
            item.__exportNames[field.key] = name;
          }
          setPath(item, field.key, v.dataUrl);
        }
        return;
      }
      setPath(item, field.key, v);
    });
  }

  /* ---------- modal UI ---------- */
  function buildFieldRow(field, value) {
    var wrap = document.createElement("div");
    wrap.className = "gg-field";
    var label = document.createElement("label");
    label.textContent = field.label;
    wrap.appendChild(label);

    var input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 6;
      input.value = value || "";
    } else if (field.type === "paragraphs") {
      input = document.createElement("textarea");
      input.rows = 6;
      input.value = (value || []).join("\n\n");
    } else if (field.type === "lines") {
      input = document.createElement("textarea");
      input.rows = 3;
      input.value = (value || []).join("\n");
    } else if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach(function (opt) {
        var o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === value) o.selected = true;
        input.appendChild(o);
      });
    } else if (field.type === "image") {
      if (value) {
        var preview = document.createElement("img");
        preview.className = "gg-field-preview";
        preview.src = value;
        wrap.appendChild(preview);
      }
      input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      var statusEl = document.createElement("span");
      statusEl.className = "gg-field-status";
      statusEl.hidden = true;
      statusEl.textContent = "이미지 처리 중...";

      input.addEventListener("change", function () {
        var file = input.files[0];
        if (!file) return;
        // Set this synchronously (before any async work starts) so the
        // save button's pending-check can never race past a file that
        // was *just* selected.
        input.dataset.pending = "1";
        delete input.dataset.dataUrl;
        statusEl.hidden = false;
        resizeImageFile(file)
          .then(function (result) {
            input.dataset.dataUrl = result.dataUrl;
            input.dataset.mimeType = result.mimeType;
            var img = wrap.querySelector(".gg-field-preview");
            if (!img) {
              img = document.createElement("img");
              img.className = "gg-field-preview";
              wrap.insertBefore(img, input);
            }
            img.src = result.dataUrl;
          })
          .catch(function (err) {
            window.alert("이미지를 불러오지 못했습니다: " + (err && err.message ? err.message : err));
          })
          .then(function () {
            input.dataset.pending = "";
            statusEl.hidden = true;
          });
      });
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.value = value || "";
    }
    input.className = "gg-field-input";
    input.dataset.fieldKey = field.key;
    input.dataset.fieldType = field.type;
    wrap.appendChild(input);
    if (field.type === "image") wrap.appendChild(statusEl);
    return wrap;
  }

  function openItemModal(opts) {
    var overlay = document.createElement("div");
    overlay.className = "gg-modal-overlay";
    var modal = document.createElement("div");
    modal.className = "gg-modal";

    var h = document.createElement("h3");
    h.textContent = opts.title;
    modal.appendChild(h);

    var form = document.createElement("div");
    form.className = "gg-modal-form";
    opts.schema.fields.forEach(function (field) {
      form.appendChild(buildFieldRow(field, getPath(opts.item, field.key)));
    });
    modal.appendChild(form);

    var actions = document.createElement("div");
    actions.className = "gg-modal-actions";

    if (!opts.isNew && opts.onDelete) {
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "gg-btn gg-btn-danger";
      delBtn.textContent = "삭제";
      delBtn.addEventListener("click", function () {
        if (window.confirm("정말 삭제하시겠어요? 되돌릴 수 없습니다.")) {
          opts.onDelete();
          close();
        }
      });
      actions.appendChild(delBtn);
    }

    var spacer = document.createElement("div");
    spacer.className = "gg-modal-spacer";
    actions.appendChild(spacer);

    var cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "gg-btn";
    cancelBtn.textContent = "취소";
    cancelBtn.addEventListener("click", close);
    actions.appendChild(cancelBtn);

    var saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "gg-btn gg-btn-primary";
    saveBtn.textContent = opts.isNew ? "추가" : "저장";
    saveBtn.addEventListener("click", function () {
      var stillPending = form.querySelector('[data-pending="1"]');
      if (stillPending) {
        window.alert("이미지를 아직 처리 중입니다. 잠시 후 다시 눌러주세요.");
        return;
      }

      var values = {};
      form.querySelectorAll("[data-field-key]").forEach(function (input) {
        var key = input.dataset.fieldKey;
        var type = input.dataset.fieldType;
        if (type === "paragraphs") {
          values[key] = input.value.split(/\n\s*\n/).map(function (s) {
            return s.trim();
          }).filter(Boolean);
        } else if (type === "lines") {
          values[key] = input.value.split("\n").map(function (s) {
            return s.trim();
          }).filter(Boolean);
        } else if (type === "image") {
          if (input.dataset.dataUrl) {
            values[key] = {
              __upload: true,
              dataUrl: input.dataset.dataUrl,
              mimeType: input.dataset.mimeType
            };
          }
        } else {
          values[key] = input.value;
        }
      });
      var result = opts.onSave(values);
      if (result !== false) close();
    });
    actions.appendChild(saveBtn);

    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
    }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
  }

  function buildLoginModal(onSuccess) {
    var overlay = document.createElement("div");
    overlay.className = "gg-modal-overlay";
    var modal = document.createElement("div");
    modal.className = "gg-modal gg-login-modal";
    modal.innerHTML =
      "<h3>관리자 로그인</h3>" +
      '<input type="password" class="gg-field-input" id="gg-login-pw" placeholder="비밀번호" autocomplete="off">' +
      '<p class="gg-login-error" id="gg-login-error" hidden>비밀번호가 올바르지 않습니다.</p>' +
      '<div class="gg-modal-actions">' +
      '<div class="gg-modal-spacer"></div>' +
      '<button type="button" class="gg-btn" id="gg-login-cancel">취소</button>' +
      '<button type="button" class="gg-btn gg-btn-primary" id="gg-login-submit">로그인</button>' +
      "</div>";
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var pwInput = modal.querySelector("#gg-login-pw");
    var errorEl = modal.querySelector("#gg-login-error");
    pwInput.focus();

    function close() {
      overlay.remove();
    }
    function submit() {
      if (pwInput.value === PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "1");
        close();
        onSuccess();
      } else {
        errorEl.hidden = false;
      }
    }
    modal.querySelector("#gg-login-submit").addEventListener("click", submit);
    pwInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit();
    });
    modal.querySelector("#gg-login-cancel").addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
  }

  /* ---------- edit buttons on rendered items ---------- */
  function scanEditButtons() {
    document.querySelectorAll("[data-gg-item]").forEach(function (el) {
      if (el.querySelector(".gg-edit-btn")) return;
      var parts = el.getAttribute("data-gg-item").split("|");
      var globalName = parts[0];
      var id = parts[1] || null;
      var schema = SCHEMAS[globalName];
      if (!schema) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gg-edit-btn";
      btn.setAttribute("aria-label", "편집");
      btn.textContent = "✏";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var item = schema.list ? findItem(globalName, id) : window[globalName];
        if (!item) return;
        openItemModal({
          title: schema.label + " 편집",
          schema: schema,
          item: item,
          isNew: false,
          onSave: function (values) {
            applyFieldValues(item, schema, values);
            var ok = saveCurrent(globalName);
            triggerRerender();
            return ok;
          },
          onDelete: schema.list ? function () {
            var arr = window[globalName];
            var idx = arr.indexOf(item);
            if (idx > -1) arr.splice(idx, 1);
            saveCurrent(globalName);
            triggerRerender();
          } : null
        });
      });

      el.classList.add("gg-item-host");
      el.appendChild(btn);

      if (schema.list && schema.reorder && id) {
        var arr = window[globalName] || [];
        var idx = -1;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] && arr[i].id === id) { idx = i; break; }
        }

        var moveGroup = document.createElement("span");
        moveGroup.className = "gg-move-group";

        var upBtn = document.createElement("button");
        upBtn.type = "button";
        upBtn.className = "gg-move-btn";
        upBtn.setAttribute("aria-label", "위로 이동");
        upBtn.textContent = "▲";
        if (idx <= 0) upBtn.disabled = true;
        upBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          moveItem(globalName, id, -1);
        });

        var downBtn = document.createElement("button");
        downBtn.type = "button";
        downBtn.className = "gg-move-btn";
        downBtn.setAttribute("aria-label", "아래로 이동");
        downBtn.textContent = "▼";
        if (idx === -1 || idx >= arr.length - 1) downBtn.disabled = true;
        downBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          moveItem(globalName, id, 1);
        });

        moveGroup.appendChild(upBtn);
        moveGroup.appendChild(downBtn);
        el.appendChild(moveGroup);
      }
    });
  }

  function attachAddButtons() {
    document.querySelectorAll("[data-gg-add]").forEach(function (btn) {
      btn.hidden = !isUnlocked();
      if (btn.dataset.ggBound) return;
      btn.dataset.ggBound = "1";
      btn.addEventListener("click", function () {
        var globalName = btn.getAttribute("data-gg-add");
        var schema = SCHEMAS[globalName];
        if (!schema || !schema.makeNew) return;
        var presetCategory = btn.getAttribute("data-gg-add-category");
        var tempItem = schema.makeNew("__temp__");
        if (presetCategory && "category" in tempItem) tempItem.category = presetCategory;

        openItemModal({
          title: schema.label + " 추가",
          schema: schema,
          item: tempItem,
          isNew: true,
          onSave: function (values) {
            var baseText = values.titleKo || values.title || values.name || "";
            if (!baseText.trim()) {
              window.alert("제목/이름을 입력해주세요.");
              return false;
            }
            var id = uniqueId(globalName, slug(baseText));
            var item = schema.makeNew(id);
            if (presetCategory && "category" in item) item.category = presetCategory;
            applyFieldValues(item, schema, values);

            var arr = window[globalName];
            if (!arr) arr = window[globalName] = [];
            if (schema.insertBefore) {
              var idx = -1;
              for (var i = 0; i < arr.length; i++) {
                if (schema.insertBefore(arr[i])) { idx = i; break; }
              }
              if (idx === -1) arr.push(item); else arr.splice(idx, 0, item);
            } else {
              arr.unshift(item);
            }
            var ok = saveCurrent(globalName);
            triggerRerender();
            return ok;
          }
        });
      });
    });
  }

  /* ---------- export ---------- */
  function prepareForExport(data, schema) {
    var items = schema.list ? data : [data];
    var imageFiles = [];
    var rewritten = items.map(function (rawItem) {
      var item = JSON.parse(JSON.stringify(rawItem, function (k, v) {
        if (k.indexOf("__") === 0) return undefined;
        return v;
      }));
      schema.fields.forEach(function (field) {
        if (field.type !== "image") return;
        var raw = getPath(rawItem, field.key);
        if (raw && /^data:/.test(raw)) {
          var name = (rawItem.__exportNames && rawItem.__exportNames[field.key]) ||
            ((field.filePrefix || "img") + "_" + (rawItem.id || slug(Date.now())) + "." + (extFromDataUrl(raw) || "jpg"));
          setPath(item, field.key, "img/" + name);
          imageFiles.push({ name: name, dataUrl: raw });
        }
      });
      return item;
    });
    return { data: schema.list ? rewritten : rewritten[0], imageFiles: imageFiles };
  }

  function serializeDataFile(globalName, data) {
    var json = JSON.stringify(data, null, 2);
    return (
      "/* Auto-generated by the gguggum 관리자 내보내기 — " + new Date().toISOString() + " */\n\n" +
      "window." + globalName + " = " + json + ";\n"
    );
  }

  function dataUrlToBlob(dataUrl) {
    return fetch(dataUrl).then(function (res) {
      return res.blob();
    });
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 4000);
  }

  function downloadFilesSequentially(files) {
    var i = 0;
    function next() {
      if (i >= files.length) return;
      var f = files[i++];
      if (f.dataUrl) {
        dataUrlToBlob(f.dataUrl).then(function (blob) {
          triggerDownload(blob, f.name);
          setTimeout(next, 300);
        });
      } else {
        triggerDownload(new Blob([f.content], { type: "text/plain" }), f.name);
        setTimeout(next, 300);
      }
    }
    next();
  }

  function exportAll() {
    var allFiles = [];
    GLOBALS.forEach(function (name) {
      var raw = loadSaved(name);
      if (raw == null) raw = window[name];
      if (raw == null) return;
      var schema = SCHEMAS[name];
      var prepared = prepareForExport(raw, schema);
      allFiles.push({ name: FILE_NAMES[name], content: serializeDataFile(name, prepared.data) });
      prepared.imageFiles.forEach(function (img) {
        allFiles.push({ name: img.name, dataUrl: img.dataUrl });
      });
    });

    if (allFiles.length === 0) {
      window.alert("내보낼 데이터가 없습니다.");
      return;
    }

    window.alert(
      allFiles.length + "개 파일을 다운로드합니다.\n" +
      "다운로드된 .js 파일은 js/ 폴더의 같은 이름 파일을 교체하고,\n" +
      "이미지 파일은 img/ 폴더에 넣은 뒤 사이트를 다시 배포해주세요."
    );
    downloadFilesSequentially(allFiles);
  }

  /* ---------- toggle bar ---------- */
  function mountToggle() {
    var bar = document.getElementById("gg-admin-toggle");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "gg-admin-toggle";
      bar.className = "gg-admin-bar";
      document.body.appendChild(bar);
    }
    renderBar();
    refreshToggleBar = renderBar;

    function renderBar() {
      if (isUnlocked()) {
        var usage = estimateStorageUsage();
        var warnClass = usage.pct >= 80 ? " gg-storage-warn" : "";
        bar.innerHTML =
          '<span class="gg-admin-status">관리자 모드</span>' +
          '<span class="gg-storage-usage' + warnClass + '" title="브라우저에 저장된 편집 내용의 대략적인 용량입니다.">저장공간 ' + usage.pct + '% 사용</span>' +
          '<button type="button" class="gg-btn gg-btn-sm" id="gg-export-btn">내보내기</button>' +
          '<button type="button" class="gg-btn gg-btn-sm gg-btn-danger" id="gg-clear-btn">저장공간 비우기</button>' +
          '<button type="button" class="gg-btn gg-btn-sm" id="gg-logout-btn">로그아웃</button>';
        bar.querySelector("#gg-export-btn").addEventListener("click", exportAll);
        bar.querySelector("#gg-clear-btn").addEventListener("click", clearAllStorage);
        bar.querySelector("#gg-logout-btn").addEventListener("click", function () {
          sessionStorage.removeItem(SESSION_KEY);
          location.reload();
        });
      } else {
        bar.innerHTML = '<button type="button" class="gg-btn gg-btn-sm" id="gg-login-btn">관리자</button>';
        bar.querySelector("#gg-login-btn").addEventListener("click", function () {
          buildLoginModal(function () {
            location.reload();
          });
        });
      }
    }
  }

  /* ---------- public API ---------- */
  function init() {
    mountToggle();
    if (isUnlocked()) {
      document.body.classList.add("gg-admin-on");
      scanEditButtons();
      attachAddButtons();
    } else {
      document.body.classList.remove("gg-admin-on");
      document.querySelectorAll("[data-gg-add]").forEach(function (btn) {
        btn.hidden = true;
      });
    }
  }

  window.ggAdmin = {
    applyOverrides: applyOverrides,
    registerRerender: registerRerender,
    init: init
  };
})();
