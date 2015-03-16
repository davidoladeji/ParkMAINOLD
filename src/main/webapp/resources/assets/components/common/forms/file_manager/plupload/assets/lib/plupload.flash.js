(function (f, b, d, e) {
    var a = {}, g = {};

    function c() {
        var h;
        try {
            h = navigator.plugins["Shockwave Flash"];
            h = h.description
        } catch (j) {
            try {
                h = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version")
            } catch (i) {
                h = "0.0"
            }
        }
        h = h.match(/\d+/g);
        return parseFloat(h[0] + "." + h[1])
    }

    d.flash = {
        trigger: function (j, h, i) {
            setTimeout(function () {
                var m = a[j], l, k;
                if (m) {
                    m.trigger("Flash:" + h, i)
                }
            }, 0)
        }
    };
    d.runtimes.Flash = d.addRuntime("flash", {
        getFeatures: function () {
            return {
                jpgresize: true,
                pngresize: true,
                maxWidth: 8091,
                maxHeight: 8091,
                chunks: true,
                progress: true,
                multipart: true,
                multi_selection: true
            }
        }, init: function (m, o) {
            var k, l, h = 0, i = b.body;
            if (c() < 10) {
                o({success: false});
                return
            }
            g[m.id] = false;
            a[m.id] = m;
            k = b.getElementById(m.settings.browse_button);
            l = b.createElement("div");
            l.id = m.id + "_flash_container";
            d.extend(l.style, {
                position: "absolute",
                top: "0px",
                background: m.settings.shim_bgcolor || "transparent",
                zIndex: 99999,
                width: "100%",
                height: "100%"
            });
            l.className = "plupload flash";
            if (m.settings.container) {
                i = b.getElementById(m.settings.container);
                if (d.getStyle(i, "position") === "static") {
                    i.style.position = "relative"
                }
            }
            i.appendChild(l);
            (function () {
                var p, q;
                p = '<object id="' + m.id + '_flash" type="application/x-shockwave-flash" data="' + m.settings.flash_swf_url + '" ';
                if (d.ua.ie) {
                    p += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
                }
                p += 'width="100%" height="100%" style="outline:0"><param name="movie" value="' + m.settings.flash_swf_url + '" /><param name="flashvars" value="id=' + escape(m.id) + '" /><param name="wmode" value="transparent" /><param name="allowscriptaccess" value="always" /></object>';
                if (d.ua.ie) {
                    q = b.createElement("div");
                    l.appendChild(q);
                    q.outerHTML = p;
                    q = null
                } else {
                    l.innerHTML = p
                }
            }());
            function n() {
                return b.getElementById(m.id + "_flash")
            }

            function j() {
                if (h++ > 5000) {
                    o({success: false});
                    return
                }
                if (g[m.id] === false) {
                    setTimeout(j, 1)
                }
            }

            j();
            k = l = null;
            m.bind("Destroy", function (p) {
                var q;
                d.removeAllEvents(b.body, p.id);
                delete g[p.id];
                delete a[p.id];
                q = b.getElementById(p.id + "_flash_container");
                if (q) {
                    q.parentNode.removeChild(q)
                }
            });
            m.bind("Flash:Init", function () {
                var r = {}, q;
                try {
                    n().setFileFilters(m.settings.filters, m.settings.multi_selection)
                } catch (p) {
                    o({success: false});
                    return
                }
                if (g[m.id]) {
                    return
                }
                g[m.id] = true;
                m.bind("UploadFile", function (s, u) {
                    var v = s.settings, t = m.settings.resize || {};
                    n().uploadFile(r[u.id], v.url, {
                        name: u.target_name || u.name,
                        mime: d.mimeTypes[u.name.replace(/^.+\.([^.]+)/, "$1").toLowerCase()] || "application/octet-stream",
                        chunk_size: v.chunk_size,
                        width: t.width,
                        height: t.height,
                        quality: t.quality,
                        multipart: v.multipart,
                        multipart_params: v.multipart_params || {},
                        file_data_name: v.file_data_name,
                        format: /\.(jpg|jpeg)$/i.test(u.name) ? "jpg" : "png",
                        headers: v.headers,
                        urlstream_upload: v.urlstream_upload
                    })
                });
                m.bind("CancelUpload", function () {
                    n().cancelUpload()
                });
                m.bind("Flash:UploadProcess", function (t, s) {
                    var u = t.getFile(r[s.id]);
                    if (u.status != d.FAILED) {
                        u.loaded = s.loaded;
                        u.size = s.size;
                        t.trigger("UploadProgress", u)
                    }
                });
                m.bind("Flash:UploadChunkComplete", function (s, u) {
                    var v, t = s.getFile(r[u.id]);
                    v = {chunk: u.chunk, chunks: u.chunks, response: u.text};
                    s.trigger("ChunkUploaded", t, v);
                    if (t.status !== d.FAILED && s.state !== d.STOPPED) {
                        n().uploadNextChunk()
                    }
                    if (u.chunk == u.chunks - 1) {
                        t.status = d.DONE;
                        s.trigger("FileUploaded", t, {response: u.text})
                    }
                });
                m.bind("Flash:SelectFiles", function (s, v) {
                    var u, t, w = [], x;
                    for (t = 0; t < v.length; t++) {
                        u = v[t];
                        x = d.guid();
                        r[x] = u.id;
                        r[u.id] = x;
                        w.push(new d.File(x, u.name, u.size))
                    }
                    if (w.length) {
                        m.trigger("FilesAdded", w)
                    }
                });
                m.bind("Flash:SecurityError", function (s, t) {
                    m.trigger("Error", {
                        code: d.SECURITY_ERROR,
                        message: d.translate("Security error."),
                        details: t.message,
                        file: m.getFile(r[t.id])
                    })
                });
                m.bind("Flash:GenericError", function (s, t) {
                    m.trigger("Error", {
                        code: d.GENERIC_ERROR,
                        message: d.translate("Generic error."),
                        details: t.message,
                        file: m.getFile(r[t.id])
                    })
                });
                m.bind("Flash:IOError", function (s, t) {
                    m.trigger("Error", {
                        code: d.IO_ERROR,
                        message: d.translate("IO error."),
                        details: t.message,
                        file: m.getFile(r[t.id])
                    })
                });
                m.bind("Flash:ImageError", function (s, t) {
                    m.trigger("Error", {
                        code: parseInt(t.code, 10),
                        message: d.translate("Image error."),
                        file: m.getFile(r[t.id])
                    })
                });
                m.bind("Flash:StageEvent:rollOver", function (s) {
                    var t, u;
                    t = b.getElementById(m.settings.browse_button);
                    u = s.settings.browse_button_hover;
                    if (t && u) {
                        d.addClass(t, u)
                    }
                });
                m.bind("Flash:StageEvent:rollOut", function (s) {
                    var t, u;
                    t = b.getElementById(m.settings.browse_button);
                    u = s.settings.browse_button_hover;
                    if (t && u) {
                        d.removeClass(t, u)
                    }
                });
                m.bind("Flash:StageEvent:mouseDown", function (s) {
                    var t, u;
                    t = b.getElementById(m.settings.browse_button);
                    u = s.settings.browse_button_active;
                    if (t && u) {
                        d.addClass(t, u);
                        d.addEvent(b.body, "mouseup", function () {
                            d.removeClass(t, u)
                        }, s.id)
                    }
                });
                m.bind("Flash:StageEvent:mouseUp", function (s) {
                    var t, u;
                    t = b.getElementById(m.settings.browse_button);
                    u = s.settings.browse_button_active;
                    if (t && u) {
                        d.removeClass(t, u)
                    }
                });
                m.bind("Flash:ExifData", function (s, t) {
                    m.trigger("ExifData", m.getFile(r[t.id]), t.data)
                });
                m.bind("Flash:GpsData", function (s, t) {
                    m.trigger("GpsData", m.getFile(r[t.id]), t.data)
                });
                m.bind("QueueChanged", function (s) {
                    m.refresh()
                });
                m.bind("FilesRemoved", function (s, u) {
                    var t;
                    for (t = 0; t < u.length; t++) {
                        n().removeFile(r[u[t].id])
                    }
                });
                m.bind("StateChanged", function (s) {
                    m.refresh()
                });
                m.bind("Refresh", function (s) {
                    var t, u, v;
                    n().setFileFilters(m.settings.filters, m.settings.multi_selection);
                    t = b.getElementById(s.settings.browse_button);
                    if (t) {
                        u = d.getPos(t, b.getElementById(s.settings.container));
                        v = d.getSize(t);
                        d.extend(b.getElementById(s.id + "_flash_container").style, {
                            top: u.y + "px",
                            left: u.x + "px",
                            width: v.w + "px",
                            height: v.h + "px"
                        })
                    }
                });
                m.bind("DisableBrowse", function (s, t) {
                    n().disableBrowse(t)
                });
                o({success: true})
            })
        }
    })
})(window, document, plupload);